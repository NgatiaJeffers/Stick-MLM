<?php
class Sticky_Multilayer_Menu {
    private static $instance;
    const VERSION = '2.0.0';
    const SLUG = 'sticky-multilayer-menu';

    public static function get_instance() {
        if (null === self::$instance) self::$instance = new self();
        return self::$instance;
    }

    private function __construct() {
        $this->define_constants();
        $this->load_dependencies();
        $this->init_hooks();

        new Sticky_Multilayer_Menu_Assets();
        new Sticky_Multilayer_Menu_Renderer();
        new Sticky_Multilayer_Menu_Admin();
        new Sticky_Multilayer_Menu_API();
        if (class_exists('WooCommerce')) new Sticky_Multilayer_Menu_WooCommerce();
    }

    private function define_constants() {
        define('STICKYMLM_VERSION', self::VERSION);
        define('STICKYMLM_PATH', plugin_dir_path(__FILE__) . '../');
        define('STICKYMLM_URL', plugin_dir_url(__FILE__) . '../');
        define('STICKYMLM_REACT_BUILD_PATH', STICKYMLM_PATH . 'assets/react-build/');
        define('STICKYMLM_REACT_BUILD_URL', STICKYMLM_URL . 'assets/react-build/');
    }

    private function load_dependencies() {
        require_once STICKYMLM_PATH . 'includes/class-sticky-multilayer-menu-assets.php';
        require_once STICKYMLM_PATH . 'includes/class-sticky-multilayer-menu-renderer.php';
        require_once STICKYMLM_PATH . 'includes/class-sticky-multilayer-menu-admin.php';
        require_once STICKYMLM_PATH . 'includes/class-sticky-multilayer-menu-woocommerce.php';
        require_once STICKYMLM_PATH . 'includes/class-sticky-multilayer-menu-api.php';
        require_once STICKYMLM_PATH . 'includes/class-sticky-multilayer-menu-walker.php';
        require_once STICKYMLM_PATH . 'includes/helpers.php';
    }

    private function init_hooks() {
        // Register menu locations
        add_action('after_setup_theme', [$this, 'register_menu_locations']);
        
        // Add body class for easier targeting
        add_filter('body_class', [$this, 'add_body_class']);
        
        // Add custom menu walker
        add_filter('wp_nav_menu_args', [$this, 'modify_nav_menu_args']);
        
        // Initialize React app
        add_action('wp_enqueue_scripts', [$this, 'maybe_enqueue_react_app']);
        
        // Add progressive enhancement fallback
        add_action('wp_head', [$this, 'add_noscript_fallback'], 1);
    }

    public function register_menu_locations() {
        register_nav_menus([
            'sticky_mlm_main' => __('Sticky MLM: Main Menu', 'sticky-mlm'),
        ]);
    }

    public function add_body_class($classes) {
        $classes[] = 'has-sticky-mlm';
        
        // Add React-specific class when React is loaded
        if ($this->should_load_react()) {
            $classes[] = 'has-sticky-mlm-react';
        }
        
        return $classes;
    }

    public function modify_nav_menu_args($args) {
        if (isset($args['theme_location']) && $args['theme_location'] === 'sticky_mlm_main') {
            $args['walker'] = new Sticky_Multilayer_Menu_Walker();
            $args['container'] = 'div';
            $args['container_class'] = 'sticky-mlm-fallback-menu';
            $args['container_id'] = 'sticky-multilayer-menu-fallback';
        }
        return $args;
    }

    /**
     * Determine if we should load the React application
     */
    private function should_load_react() {
        // Check if React build files exist
        $manifest_path = STICKYMLM_REACT_BUILD_PATH . 'manifest.json';
        if (!file_exists($manifest_path)) {
            return false;
        }

        // Allow filtering
        return apply_filters('sticky_mlm_load_react', true);
    }

    /**
     * Enqueue React application assets
     */
    public function maybe_enqueue_react_app() {
        if (!$this->should_load_react()) {
            return;
        }

        // Temporary: Use simple JavaScript test instead of React
        if (isset($_GET['sticky_simple_test'])) {
            wp_enqueue_script(
                'sticky-mlm-simple-test',
                STICKYMLM_URL . 'assets/js/simple-menu-test.js',
                [],
                STICKYMLM_VERSION,
                true
            );
            
            // Localize script with WordPress data
            wp_localize_script('sticky-mlm-simple-test', 'stickyMLMData', [
                'apiUrl' => rest_url(),
                'nonce' => wp_create_nonce('wp_rest'),
                'menuData' => $this->get_menu_data(),
                'currentUrl' => $this->get_current_url(),
                'isWooCommerceActive' => class_exists('WooCommerce'),
                'userId' => get_current_user_id(),
                'isUserLoggedIn' => is_user_logged_in(),
                'cartUrl' => class_exists('WooCommerce') ? wc_get_cart_url() : '',
                'checkoutUrl' => class_exists('WooCommerce') ? wc_get_checkout_url() : '',
            ]);
            
            return;
        }

        // Read Vite manifest
        $manifest_path = STICKYMLM_REACT_BUILD_PATH . 'manifest.json';
        $manifest = json_decode(file_get_contents($manifest_path), true);

        if (!$manifest || !isset($manifest['src/main.tsx'])) {
            return;
        }

        $main_entry = $manifest['src/main.tsx'];
        
        // Enqueue React app CSS
        if (isset($main_entry['css'])) {
            foreach ($main_entry['css'] as $css_file) {
                wp_enqueue_style(
                    'sticky-mlm-react-css',
                    STICKYMLM_REACT_BUILD_URL . $css_file,
                    [],
                    STICKYMLM_VERSION
                );
            }
        }

        // Enqueue React app JS
        wp_enqueue_script(
            'sticky-mlm-react-app',
            STICKYMLM_REACT_BUILD_URL . $main_entry['file'],
            [], // No dependencies since React is bundled
            STICKYMLM_VERSION,
            true
        );

        // Localize script with WordPress data
        wp_localize_script('sticky-mlm-react-app', 'stickyMLMData', [
            'apiUrl' => rest_url(),
            'nonce' => wp_create_nonce('wp_rest'),
            'menuData' => $this->get_menu_data(),
            'currentUrl' => $this->get_current_url(),
            'isWooCommerceActive' => class_exists('WooCommerce'),
            'userId' => get_current_user_id(),
            'isUserLoggedIn' => is_user_logged_in(),
            'cartUrl' => class_exists('WooCommerce') ? wc_get_cart_url() : '',
            'checkoutUrl' => class_exists('WooCommerce') ? wc_get_checkout_url() : '',
        ]);
        
        // Debug output for WordPress data
        if (isset($_GET['sticky_mlm_debug']) && current_user_can('manage_options')) {
            $menu_data = $this->get_menu_data();
            wp_add_inline_script('sticky-mlm-react-app', '
                console.log("=== Sticky MLM Debug Info ===");
                console.log("WordPress Data:", window.stickyMLMData);
                console.log("Menu Data Available:", !!window.stickyMLMData?.menuData);
                console.log("Menu Items Count:", window.stickyMLMData?.menuData?.items?.length || 0);
                console.log("React Container:", document.getElementById("sticky-multilayer-menu-root"));
                console.log("React Mount:", document.querySelector(".sticky-multilayer-menu-react-mount"));
            ');
        }
    }

    /**
     * Get menu data for React hydration
     */
    private function get_menu_data() {
        $menu_location = 'sticky_mlm_main';
        $locations = get_nav_menu_locations();
        
        if (!isset($locations[$menu_location])) {
            return null;
        }

        $menu = wp_get_nav_menu_object($locations[$menu_location]);
        if (!$menu) {
            return null;
        }

        $menu_items = wp_get_nav_menu_items($menu->term_id);
        if (!$menu_items) {
            return null;
        }

        // Transform menu items for React
        $transformed_items = [];
        foreach ($menu_items as $item) {
            $transformed_items[] = [
                'ID' => $item->ID,
                'title' => $item->title,
                'url' => $item->url,
                'menu_item_parent' => $item->menu_item_parent,
                'menu_order' => $item->menu_order,
                'target' => $item->target,
                'classes' => $item->classes,
                'description' => $item->description,
                'current' => in_array('current-menu-item', $item->classes),
                'current_item_ancestor' => in_array('current-menu-ancestor', $item->classes),
                'level' => $this->calculate_menu_level($item, $menu_items),
            ];
        }

        return [
            'id' => $menu->term_id,
            'name' => $menu->name,
            'location' => $menu_location,
            'items' => $transformed_items,
        ];
    }

    /**
     * Calculate menu item level in hierarchy
     */
    private function calculate_menu_level($item, $all_items) {
        $level = 1;
        $parent_id = $item->menu_item_parent;
        
        while ($parent_id != 0) {
            $level++;
            $parent_item = null;
            
            foreach ($all_items as $menu_item) {
                if ($menu_item->ID == $parent_id) {
                    $parent_item = $menu_item;
                    break;
                }
            }
            
            if ($parent_item) {
                $parent_id = $parent_item->menu_item_parent;
            } else {
                break;
            }
            
            // Prevent infinite loops and limit to 3 levels
            if ($level > 3) break;
        }
        
        return $level;
    }

    /**
     * Get current URL for menu state initialization
     */
    private function get_current_url() {
        global $wp;
        return home_url(add_query_arg([], $wp->request));
    }

    /**
     * Add noscript fallback for progressive enhancement
     */
    public function add_noscript_fallback() {
        if (!$this->should_load_react()) {
            return;
        }
        
        echo '<noscript><style>.sticky-mlm-fallback-menu { display: block !important; }</style></noscript>' . "\n";
        echo '<style>.has-sticky-mlm-react .sticky-mlm-fallback-menu { display: none; }</style>' . "\n";
    }
}
