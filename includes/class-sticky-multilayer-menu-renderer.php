<?php
/**
 * Sticky Multi-Layer Menu Render Class
 * Handles both React app rendering and fallback menu rendering
 */
class Sticky_Multilayer_Menu_Renderer {
    
    public function __construct() {
        add_action('wp_footer', [$this, 'render_menu_container'], 5);
        add_shortcode('sticky_multilayer_menu', [$this, 'shortcode_render']);
        add_action('wp_head', [$this, 'add_progressive_enhancement_styles'], 20);
    }
    
    /**
     * Render the main menu container in footer
     */
    public function render_menu_container() {
        // Only render if the theme hasn't manually placed it
        if (!$this->has_manual_placement()) {
            $this->render();
        }
    }
    
    /**
     * Main render method
     */
    public function render($args = []) {
        $defaults = [
            'location' => 'sticky_mlm_main',
            'container_id' => 'sticky-multilayer-menu-root',
            'fallback_id' => 'sticky-multilayer-menu-fallback',
            'show_fallback' => true,
        ];
        
        $args = wp_parse_args($args, $defaults);
        
        // Start output buffering
        ob_start();
        ?>
        
        <!-- Sticky Multi-Layer Menu Container -->
        <div id="<?php echo esc_attr($args['container_id']); ?>" 
             class="sticky-multilayer-menu-container"
             role="banner"
             style="position: relative; z-index: 9999;"
             aria-label="<?php esc_attr_e('Main navigation', 'sticky-mlm'); ?>">
             
            <!-- Debug info for troubleshooting -->
            <?php if (isset($_GET['sticky_mlm_debug']) && current_user_can('manage_options')): ?>
                <div style="background: #f0f0f0; padding: 10px; margin: 10px 0; border: 1px solid #ccc; font-size: 12px;">
                    <strong>Debug:</strong> Menu container rendered at <?php echo date('H:i:s'); ?> | 
                    Location: <?php echo esc_html($args['location']); ?> | 
                    Has Menu: <?php echo has_nav_menu($args['location']) ? 'Yes' : 'No'; ?>
                </div>
            <?php endif; ?>
             
            <?php if ($args['show_fallback']): ?>
                <!-- Progressive Enhancement Fallback -->
                <?php $this->render_fallback_menu($args); ?>
            <?php endif; ?>
            
            <!-- React App will mount here -->
            <div class="sticky-multilayer-menu-react-mount" 
                 data-location="<?php echo esc_attr($args['location']); ?>"
                 style="min-height: 60px; background: rgba(66, 133, 244, 0.1); border: 1px dashed rgba(66, 133, 244, 0.3);">
                <!-- Loading state -->
                <div class="sticky-multilayer-menu-loading" style="padding: 20px; text-align: center; color: #4285f4;">
                    <span class="screen-reader-text"><?php _e('Loading navigation menu...', 'sticky-mlm'); ?></span>
                    <div class="sticky-multilayer-menu-spinner" aria-hidden="true">⟳ Loading React Menu...</div>
                </div>
            </div>
        </div>
        
        <?php
        echo ob_get_clean();
    }
    
    /**
     * Render fallback menu for progressive enhancement
     */
    private function render_fallback_menu($args) {
        $menu_location = $args['location'];
        
        if (!has_nav_menu($menu_location)) {
            echo '<p class="sticky-multilayer-menu-no-menu">';
            if (current_user_can('manage_options')) {
                printf(
                    __('No menu assigned to location "%s". <a href="%s">Assign a menu</a>', 'sticky-mlm'),
                    esc_html($menu_location),
                    esc_url(admin_url('nav-menus.php'))
                );
            } else {
                _e('Navigation menu is not available.', 'sticky-mlm');
            }
            echo '</p>';
            return;
        }
        
        // Render traditional WordPress menu as fallback
        wp_nav_menu([
            'theme_location' => $menu_location,
            'container' => 'nav',
            'container_class' => 'sticky-multilayer-menu-fallback',
            'container_id' => $args['fallback_id'],
            'menu_class' => 'sticky-multilayer-menu-fallback-list',
            'depth' => 3, // Support up to 3 levels
            'walker' => new Sticky_Multilayer_Menu_Walker(),
            'fallback_cb' => [$this, 'fallback_menu_callback'],
        ]);
    }
    
    /**
     * Fallback callback when no menu is set
     */
    public function fallback_menu_callback($args) {
        if (!current_user_can('manage_options')) {
            return '';
        }
        
        $container = $args['container'] ?? 'div';
        $container_class = $args['container_class'] ?? '';
        $container_id = $args['container_id'] ?? '';
        
        $output = '<' . $container;
        
        if ($container_class) {
            $output .= ' class="' . esc_attr($container_class) . '"';
        }
        
        if ($container_id) {
            $output .= ' id="' . esc_attr($container_id) . '"';
        }
        
        $output .= '>';
        $output .= '<ul class="sticky-multilayer-menu-fallback-list">';
        $output .= '<li class="menu-item">';
        $output .= '<a href="' . esc_url(admin_url('nav-menus.php')) . '">';
        $output .= __('Setup Menu', 'sticky-mlm');
        $output .= '</a>';
        $output .= '</li>';
        $output .= '</ul>';
        $output .= '</' . $container . '>';
        
        return $output;
    }
    
    /**
     * Shortcode rendering
     */
    public function shortcode_render($atts = []) {
        $atts = shortcode_atts([
            'location' => 'sticky_mlm_main',
            'show_fallback' => 'yes',
        ], $atts, 'sticky_multilayer_menu');
        
        // Convert string to boolean
        $atts['show_fallback'] = ($atts['show_fallback'] === 'yes');
        
        ob_start();
        $this->render($atts);
        return ob_get_clean();
    }
    
    /**
     * Check if menu has been manually placed
     */
    private function has_manual_placement() {
        global $post;
        
        // Check if shortcode is used
        if ($post && has_shortcode($post->post_content, 'sticky_multilayer_menu')) {
            return true;
        }
        
        // Check if theme has manually rendered it
        if (did_action('sticky_mlm_manual_render')) {
            return true;
        }
        
        // Allow themes to indicate manual placement
        return apply_filters('sticky_mlm_has_manual_placement', false);
    }
    
    /**
     * Add inline styles for progressive enhancement
     */
    public function add_progressive_enhancement_styles() {
        ?>
        <style id="sticky-mlm-progressive-styles">
            /* Progressive enhancement styles */
            .sticky-multilayer-menu-container {
                position: relative;
                z-index: 1000;
            }
            
            .sticky-multilayer-menu-fallback {
                display: block;
                background: #fff;
                border-bottom: 1px solid #e5e5e5;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .sticky-multilayer-menu-fallback-list {
                list-style: none;
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 16px;
            }
            
            .sticky-multilayer-menu-fallback .menu-item {
                margin: 0;
            }
            
            .sticky-multilayer-menu-fallback .menu-item > a {
                display: block;
                padding: 16px 12px;
                text-decoration: none;
                color: #333;
                font-weight: 500;
                transition: color 0.3s ease;
            }
            
            .sticky-multilayer-menu-fallback .menu-item > a:hover,
            .sticky-multilayer-menu-fallback .current-menu-item > a {
                color: #0073aa;
            }
            
            .sticky-multilayer-menu-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                min-height: 60px;
            }
            
            .sticky-multilayer-menu-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid #e5e5e5;
                border-top: 2px solid #0073aa;
                border-radius: 50%;
                animation: sticky-mlm-spin 1s linear infinite;
            }
            
            @keyframes sticky-mlm-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Hide React mount point until React loads */
            .sticky-multilayer-menu-react-mount {
                display: none !important;
            }
            
            /* Hide fallback when React is loaded */
            .has-sticky-mlm-react .sticky-multilayer-menu-fallback {
                display: none !important;
            }
            
            /* Show React mount point when React is loaded */
            .has-sticky-mlm-react .sticky-multilayer-menu-react-mount {
                display: block !important;
            }
            
            @media (max-width: 768px) {
                .sticky-multilayer-menu-fallback-list {
                    flex-direction: column;
                    align-items: stretch;
                    padding: 0;
                }
                
                .sticky-multilayer-menu-fallback .menu-item > a {
                    border-bottom: 1px solid #e5e5e5;
                    padding: 16px 20px;
                }
            }
        </style>
        <?php
    }
    
    // Legacy methods for backward compatibility
    public function render_cart_link() {
        if (function_exists('wc_get_cart_url')) {
            $count = $this->get_cart_count();
            $url   = wc_get_cart_url();
            echo '<a class="mlm-util mlm-util--cart" href="'.esc_url($url).'" aria-label="'.esc_attr__('Shopping Cart','sticky-mlm').'">'
                . '<span class="mlm-cart__icon" aria-hidden="true">🛒</span>'
                . '<span class="mlm-cart__count" data-mlm-cart-count>'.intval($count).'</span>'
                . '</a>';
        }
    }

    private function get_cart_count() {
        if (function_exists('WC') && WC()->cart) {
            return WC()->cart->get_cart_contents_count();
        }
        return 0;
    }
}
