<?php
class Sticky_Multilayer_Menu_Assets {
    public function __construct() {
        add_action('wp_enqueue_scripts', [$this, 'frontend_assets']);
        add_action('admin_enqueue_scripts', [$this, 'admin_assets']);
    }

    public function frontend_assets() {
    // Determine if we should use minified files
    $is_debug = (defined('SCRIPT_DEBUG') && SCRIPT_DEBUG) || (defined('WP_DEBUG') && WP_DEBUG);
    $css_suffix = $is_debug ? '' : '.min';
    $js_suffix = $is_debug ? '' : '.min';

        // Enqueue CSS
        wp_enqueue_style(
            'sticky-mlm', 
            STICKYMLM_URL . "assets/css/sticky-multilayer-menu{$css_suffix}.css", 
            [], 
            STICKYMLM_VERSION
        );

        // Inject dynamic colors from settings
        $scheme = get_option('stickymlm_color_scheme', 'digicape');
        $defaults = [
            'main_bg' => '#4285f4',        // DigiCape blue
            'secondary_bg' => '#5a2d82',   // Purple bar
            'tertiary_bg' => '#2c1a4d',    // Darker purple
            'secondary_underline' => '#a78bfa',
            'tertiary_underline' => '#c4b5fd',
        ];

        // Presets
        $presets = [
            'digicape' => [
                'main_bg' => '#4285f4',        // DigiCape blue
                'secondary_bg' => '#5a2d82',   // Purple bar
                'tertiary_bg' => '#401e5a',    // Darker purple
                'secondary_underline' => '#a78bfa',  // Light purple underline
                'tertiary_underline' => '#c4b5fd',   // Lighter purple underline
            ],
            'dark' => [
                'main_bg' => '#1f2937',        // Dark gray
                'secondary_bg' => '#374151',   // Medium gray
                'tertiary_bg' => '#111827',    // Darker gray
                'secondary_underline' => '#60a5fa',  // Blue accent
                'tertiary_underline' => '#93c5fd',   // Light blue accent
            ],
            'light' => [
                'main_bg' => '#ffffff',        // White
                'secondary_bg' => '#f8fafc',   // Very light gray
                'tertiary_bg' => '#e2e8f0',    // Light gray
                'secondary_underline' => '#3b82f6',  // Blue underline
                'tertiary_underline' => '#1d4ed8',   // Darker blue underline
            ],
            'corporate' => [
                'main_bg' => '#0f172a',        // Navy blue
                'secondary_bg' => '#1e293b',   // Slate blue
                'tertiary_bg' => '#334155',    // Light slate
                'secondary_underline' => '#fbbf24',  // Amber accent
                'tertiary_underline' => '#f59e0b',   // Orange accent
            ],
        ];

        if ($scheme === 'custom') {
            $colors = get_option('stickymlm_colors', $defaults);
        } else {
            $colors = isset($presets[$scheme]) ? $presets[$scheme] : $defaults;
        }

        $main_bg = isset($colors['main_bg']) ? $colors['main_bg'] : $defaults['main_bg'];
        $secondary_bg = isset($colors['secondary_bg']) ? $colors['secondary_bg'] : $defaults['secondary_bg'];
        $tertiary_bg = isset($colors['tertiary_bg']) ? $colors['tertiary_bg'] : $defaults['tertiary_bg'];
        $secondary_underline = isset($colors['secondary_underline']) ? $colors['secondary_underline'] : $defaults['secondary_underline'];
        $tertiary_underline = isset($colors['tertiary_underline']) ? $colors['tertiary_underline'] : $defaults['tertiary_underline'];

        $dynamic_css = ":root{--mlm-main-bg: {$main_bg}; --mlm-secondary-bg: {$secondary_bg}; --mlm-tertiary-bg: {$tertiary_bg}; --mlm-secondary-underline: {$secondary_underline}; --mlm-tertiary-underline: {$tertiary_underline};}\n".
            ".sticky-mlm__row--main{background: var(--mlm-main-bg) !important;}\n".
            ".sticky-mlm__secondary-container{background: var(--mlm-secondary-bg) !important;}\n".
            ".sticky-mlm__tertiary-container{background: var(--mlm-tertiary-bg) !important;}\n".
            ".sticky-mlm__secondary-container .mlm-menu--level2 > li > a{position:relative;}\n".
            ".sticky-mlm__secondary-container .mlm-menu--level2 > li > a::after{content:'';position:absolute;left:0;right:0;bottom:-3px;height:3px;background:var(--mlm-secondary-underline);opacity:0;transform:scaleX(0);transform-origin:center;transition:all 0.2s ease;}\n".
            ".sticky-mlm__secondary-container .mlm-menu--level2 > li:hover > a::after, .sticky-mlm__secondary-container .mlm-menu--level2 > li.mlm-item--active > a::after, .sticky-mlm__secondary-container .mlm-menu--level2 > li.current-menu-item > a::after, .sticky-mlm__secondary-container .mlm-menu--level2 > li.active > a::after{opacity:1;transform:scaleX(1);}\n".
            ".sticky-mlm__tertiary-container .mlm-menu--level3 > li > a{position:relative;}\n".
            ".sticky-mlm__tertiary-container .mlm-menu--level3 > li > a::after{content:'';position:absolute;left:0;right:0;bottom:-3px;height:2px;background:var(--mlm-tertiary-underline);opacity:0;transform:scaleX(0);transform-origin:center;transition:all 0.2s ease;}\n".
            ".sticky-mlm__tertiary-container .mlm-menu--level3 > li:hover > a::after, .sticky-mlm__tertiary-container .mlm-menu--level3 > li.mlm-item--active > a::after, .sticky-mlm__tertiary-container .mlm-menu--level3 > li.current-menu-item > a::after, .sticky-mlm__tertiary-container .mlm-menu--level3 > li.active > a::after{opacity:1;transform:scaleX(1);}\n";

        wp_add_inline_style('sticky-mlm', $dynamic_css);

        // Enqueue JavaScript
        wp_enqueue_script(
            'sticky-mlm', 
            STICKYMLM_URL . "assets/js/sticky-multilayer-menu{$js_suffix}.js", 
            [], 
            STICKYMLM_VERSION, 
            true
        );

        // Localize script with cart count and other data
        wp_localize_script('sticky-mlm', 'StickyMLM', [
            'cartCount' => $this->get_cart_count(),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('sticky_mlm_nonce'),
            'isDebug' => $is_debug,
            'version' => STICKYMLM_VERSION,
        ]);
    }

    public function admin_assets($hook) {
        // Debug: Log which hook is being called
        error_log("Admin assets hook called: " . $hook);
        
        // Only load admin assets on our settings page
        if ($hook !== 'toplevel_page_sticky-mlm') {
            error_log("Hook doesn't match, skipping admin assets");
            return;
        }
        
        error_log("Loading admin assets for sticky-mlm");
        
        wp_enqueue_style(
            'sticky-mlm-admin', 
            STICKYMLM_URL . 'admin/css/admin.css', 
            [], 
            STICKYMLM_VERSION
        );
        
        wp_enqueue_script(
            'sticky-mlm-admin', 
            STICKYMLM_URL . 'admin/js/admin.js', 
            ['jquery'], 
            STICKYMLM_VERSION, 
            true
        );
        
        // Ensure jQuery is available
        wp_localize_script('sticky-mlm-admin', 'StickyMLMAdmin', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('sticky_mlm_admin_nonce'),
            'debug' => defined('WP_DEBUG') && WP_DEBUG,
        ]);
        
        error_log("Admin assets enqueued successfully");
    }

    private function get_cart_count() {
        if (class_exists('WooCommerce') && function_exists('WC') && WC()->cart) {
            return WC()->cart->get_cart_contents_count();
        }
        return 0;
    }
}
