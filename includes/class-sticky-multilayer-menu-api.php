<?php
/**
 * REST API endpoints for Sticky Multi-Layer Menu React integration
 */
class Sticky_Multilayer_Menu_API {
    
    private $namespace = 'sticky-multilayer-menu/v1';

    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Get menu hierarchy
        register_rest_route($this->namespace, '/menu/(?P<location>\w+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_menu_hierarchy'],
            'permission_callback' => '__return_true',
            'args' => [
                'location' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_string($param) && !empty($param);
                    }
                ]
            ]
        ]);

        // Get menu locations
        register_rest_route($this->namespace, '/menu-locations', [
            'methods' => 'GET',
            'callback' => [$this, 'get_menu_locations'],
            'permission_callback' => '__return_true'
        ]);

        // Check if menu exists at location
        register_rest_route($this->namespace, '/menu/(?P<location>\w+)/exists', [
            'methods' => 'GET',
            'callback' => [$this, 'menu_exists'],
            'permission_callback' => '__return_true'
        ]);

        // Get menu by ID
        register_rest_route($this->namespace, '/menu-by-id/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_menu_by_id'],
            'permission_callback' => '__return_true'
        ]);

        // WooCommerce cart endpoints (if WooCommerce is active)
        if (class_exists('WooCommerce')) {
            $this->register_woocommerce_routes();
        }
    }

    /**
     * Get menu hierarchy for a specific location
     */
    public function get_menu_hierarchy($request) {
        $location = $request->get_param('location');
        
        try {
            $menu_data = $this->get_menu_data_by_location($location);
            
            if (!$menu_data) {
                return new WP_Error(
                    'menu_not_found',
                    'No menu found at the specified location',
                    ['status' => 404]
                );
            }

            return rest_ensure_response($menu_data);

        } catch (Exception $e) {
            return new WP_Error(
                'menu_error',
                'Error retrieving menu: ' . $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Get available menu locations
     */
    public function get_menu_locations() {
        $registered_menus = get_registered_nav_menus();
        $menu_locations = get_nav_menu_locations();
        
        $locations = [];
        foreach ($registered_menus as $location => $description) {
            $locations[] = [
                'location' => $location,
                'description' => $description,
                'has_menu' => isset($menu_locations[$location]) && !empty($menu_locations[$location])
            ];
        }

        return rest_ensure_response(['locations' => $locations]);
    }

    /**
     * Check if menu exists at location
     */
    public function menu_exists($request) {
        $location = $request->get_param('location');
        $locations = get_nav_menu_locations();
        
        $exists = isset($locations[$location]) && !empty($locations[$location]);
        
        return rest_ensure_response(['exists' => $exists]);
    }

    /**
     * Get menu by ID
     */
    public function get_menu_by_id($request) {
        $menu_id = $request->get_param('id');
        
        try {
            $menu = wp_get_nav_menu_object($menu_id);
            
            if (!$menu) {
                return new WP_Error(
                    'menu_not_found',
                    'Menu not found',
                    ['status' => 404]
                );
            }

            $menu_data = $this->transform_menu_for_api($menu);
            return rest_ensure_response($menu_data);

        } catch (Exception $e) {
            return new WP_Error(
                'menu_error',
                'Error retrieving menu: ' . $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Get menu data by location
     */
    private function get_menu_data_by_location($location) {
        $locations = get_nav_menu_locations();
        
        if (!isset($locations[$location])) {
            return null;
        }

        $menu = wp_get_nav_menu_object($locations[$location]);
        if (!$menu) {
            return null;
        }

        return $this->transform_menu_for_api($menu, $location);
    }

    /**
     * Transform WordPress menu for API response
     */
    private function transform_menu_for_api($menu, $location = null) {
        $menu_items = wp_get_nav_menu_items($menu->term_id);
        
        if (!$menu_items) {
            $menu_items = [];
        }

        $transformed_items = [];
        foreach ($menu_items as $item) {
            $transformed_items[] = [
                'ID' => $item->ID,
                'title' => $item->title,
                'url' => $item->url,
                'menu_item_parent' => $item->menu_item_parent,
                'menu_order' => $item->menu_order,
                'target' => $item->target ?: '_self',
                'classes' => array_filter($item->classes ?: []),
                'description' => $item->description ?: '',
                'current' => in_array('current-menu-item', $item->classes ?: []),
                'current_item_ancestor' => in_array('current-menu-ancestor', $item->classes ?: []),
                'level' => $this->calculate_menu_level($item, $menu_items),
                'object_id' => $item->object_id,
                'object' => $item->object,
                'type' => $item->type,
            ];
        }

        return [
            'id' => $menu->term_id,
            'name' => $menu->name,
            'slug' => $menu->slug,
            'location' => $location ?: 'unknown',
            'items' => $transformed_items,
            'count' => count($transformed_items),
        ];
    }

    /**
     * Calculate menu item level
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
     * Register WooCommerce-specific routes
     */
    private function register_woocommerce_routes() {
        // Get cart info
        register_rest_route($this->namespace, '/woocommerce/cart', [
            'methods' => 'GET',
            'callback' => [$this, 'get_woocommerce_cart'],
            'permission_callback' => '__return_true'
        ]);

        // Get product categories
        register_rest_route($this->namespace, '/woocommerce/categories', [
            'methods' => 'GET',
            'callback' => [$this, 'get_product_categories'],
            'permission_callback' => '__return_true'
        ]);
    }

    /**
     * Get WooCommerce cart information
     */
    public function get_woocommerce_cart() {
        if (!class_exists('WooCommerce')) {
            return new WP_Error(
                'woocommerce_not_active',
                'WooCommerce is not active',
                ['status' => 404]
            );
        }

        try {
            // Initialize WooCommerce cart if needed
            if (is_null(WC()->cart)) {
                wc_load_cart();
            }

            $cart = WC()->cart;
            $cart_data = [
                'item_count' => $cart->get_cart_contents_count(),
                'total_amount' => $cart->get_cart_total(),
                'currency' => get_woocommerce_currency(),
                'currency_symbol' => get_woocommerce_currency_symbol(),
                'items' => [],
                'cart_url' => wc_get_cart_url(),
                'checkout_url' => wc_get_checkout_url(),
            ];

            // Get cart items
            foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
                $product = $cart_item['data'];
                $cart_data['items'][] = [
                    'key' => $cart_item_key,
                    'product_id' => $cart_item['product_id'],
                    'name' => $product->get_name(),
                    'quantity' => $cart_item['quantity'],
                    'price' => $cart_item['line_total'],
                    'image' => wp_get_attachment_image_src(get_post_thumbnail_id($cart_item['product_id']), 'thumbnail'),
                    'permalink' => get_permalink($cart_item['product_id']),
                ];
            }

            return rest_ensure_response($cart_data);

        } catch (Exception $e) {
            return new WP_Error(
                'cart_error',
                'Error retrieving cart: ' . $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Get WooCommerce product categories
     */
    public function get_product_categories() {
        if (!class_exists('WooCommerce')) {
            return new WP_Error(
                'woocommerce_not_active',
                'WooCommerce is not active',
                ['status' => 404]
            );
        }

        try {
            $categories = get_terms([
                'taxonomy' => 'product_cat',
                'hide_empty' => false,
                'orderby' => 'name',
                'order' => 'ASC',
            ]);

            $category_data = [];
            foreach ($categories as $category) {
                $category_data[] = [
                    'id' => $category->term_id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'parent' => $category->parent ?: null,
                    'count' => $category->count,
                    'permalink' => get_term_link($category),
                    'image' => $this->get_category_image($category->term_id),
                ];
            }

            return rest_ensure_response(['categories' => $category_data]);

        } catch (Exception $e) {
            return new WP_Error(
                'categories_error',
                'Error retrieving categories: ' . $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Get category image URL
     */
    private function get_category_image($category_id) {
        $image_id = get_term_meta($category_id, 'thumbnail_id', true);
        if ($image_id) {
            return wp_get_attachment_image_src($image_id, 'thumbnail');
        }
        return null;
    }
}
