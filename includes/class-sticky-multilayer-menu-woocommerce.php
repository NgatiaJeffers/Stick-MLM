<?php
class Sticky_Multilayer_Menu_WooCommerce {
    public function __construct() {
        // Update cart count via AJAX when items are added/removed
        add_action('wp_ajax_update_sticky_mlm_cart', [$this, 'ajax_update_cart_count']);
        add_action('wp_ajax_nopriv_update_sticky_mlm_cart', [$this, 'ajax_update_cart_count']);
        
        // Hook into WooCommerce cart updates
        add_action('woocommerce_add_to_cart', [$this, 'refresh_cart_fragments'], 10, 2);
        add_action('woocommerce_cart_item_removed', [$this, 'refresh_cart_fragments'], 10, 2);
        add_action('woocommerce_cart_item_restored', [$this, 'refresh_cart_fragments'], 10, 2);
        add_action('woocommerce_after_cart_item_quantity_update', [$this, 'refresh_cart_fragments'], 10, 2);
        
        // Add cart fragments for AJAX updates
        add_filter('woocommerce_add_to_cart_fragments', [$this, 'cart_count_fragment']);
    }

    public function ajax_update_cart_count() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'sticky_mlm_nonce')) {
            wp_die('Security check failed');
        }

        wp_send_json_success([
            'count' => $this->get_cart_count()
        ]);
    }

    public function refresh_cart_fragments() {
        // This will trigger WooCommerce's fragment refresh system
        WC_AJAX::get_refreshed_fragments();
    }

    public function cart_count_fragment($fragments) {
        $fragments['[data-mlm-cart-count]'] = '<span class="mlm-cart__count" data-mlm-cart-count>' . $this->get_cart_count() . '</span>';
        return $fragments;
    }

    public function get_cart_count() {
        if (function_exists('WC') && WC()->cart) {
            return WC()->cart->get_cart_contents_count();
        }
        return 0;
    }

    public function get_cart_url() {
        if (function_exists('wc_get_cart_url')) {
            return wc_get_cart_url();
        }
        return home_url('/cart/');
    }

    public function get_account_url() {
        if (function_exists('wc_get_page_permalink')) {
            return wc_get_page_permalink('myaccount');
        }
        return wp_login_url();
    }

    public function get_shop_url() {
        if (function_exists('wc_get_page_permalink')) {
            return wc_get_page_permalink('shop');
        }
        return home_url('/shop/');
    }
}