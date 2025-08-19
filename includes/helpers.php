<?php
/**
 * Helper functions for Sticky Multi-Layer Menu
 */

if (!defined('ABSPATH')) exit;

/**
 * Template tag for themes to render the sticky menu
 * 
 * @param array $args Configuration options
 * @return void
 */
function sticky_multilayer_menu($args = []) {
    $render = new StickyMLM_Render();
    $render->render($args);
}

/**
 * Get the sticky menu HTML as a string
 * 
 * @param array $args Configuration options
 * @return string
 */
function get_sticky_multilayer_menu($args = []) {
    ob_start();
    sticky_multilayer_menu($args);
    return ob_get_clean();
}

/**
 * Check if a specific menu location has a menu assigned
 * 
 * @param string $location Menu location slug
 * @return bool
 */
function sticky_mlm_has_menu($location) {
    return has_nav_menu($location);
}

/**
 * Get cart count for display
 * 
 * @return int
 */
function sticky_mlm_get_cart_count() {
    if (class_exists('WooCommerce') && function_exists('WC') && WC()->cart) {
        return WC()->cart->get_cart_contents_count();
    }
    return 0;
}

/**
 * Get WooCommerce URLs
 * 
 * @param string $page Page type (cart, account, shop)
 * @return string
 */
function sticky_mlm_get_wc_url($page = 'cart') {
    switch ($page) {
        case 'cart':
            return function_exists('wc_get_cart_url') ? wc_get_cart_url() : home_url('/cart/');
        case 'account':
            return function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : wp_login_url();
        case 'shop':
            return function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url('/shop/');
        default:
            return home_url('/');
    }
}

/**
 * Check if we're on a WooCommerce page
 * 
 * @return bool
 */
function sticky_mlm_is_woocommerce() {
    return function_exists('is_woocommerce') && (is_woocommerce() || is_cart() || is_checkout() || is_account_page());
}

/**
 * Get plugin settings with defaults
 * 
 * @param string $key Setting key
 * @param mixed $default Default value
 * @return mixed
 */
function sticky_mlm_get_option($key, $default = null) {
    $options = get_option('stickymlm_settings', []);
    return isset($options[$key]) ? $options[$key] : $default;
}

/**
 * Save plugin setting
 * 
 * @param string $key Setting key
 * @param mixed $value Setting value
 * @return bool
 */
function sticky_mlm_update_option($key, $value) {
    $options = get_option('stickymlm_settings', []);
    $options[$key] = $value;
    return update_option('stickymlm_settings', $options);
}

/**
 * Render search form (WooCommerce or WordPress)
 * 
 * @return void
 */
function sticky_mlm_search_form() {
    if (function_exists('is_woocommerce') && function_exists('get_product_search_form')) {
        get_product_search_form();
    } else {
        get_search_form();
    }
}

/**
 * Generate menu location names
 * 
 * @return array
 */
function sticky_mlm_get_menu_locations() {
    return [
        'sticky_mlm_primary'   => __('Sticky MLM: Primary (top row)', 'sticky-mlm'),
        'sticky_mlm_secondary' => __('Sticky MLM: Secondary (middle bar)', 'sticky-mlm'),
        'sticky_mlm_tertiary'  => __('Sticky MLM: Tertiary (breadcrumb-like row)', 'sticky-mlm'),
    ];
}

/**
 * Check if the plugin should auto-render
 * 
 * @return bool
 */
function sticky_mlm_should_auto_render() {
    $auto_render = sticky_mlm_get_option('auto_render', true);
    return apply_filters('sticky_mlm_auto_render', $auto_render);
}

/**
 * Get the menu classes for different contexts
 * 
 * @param string $context Context (primary, secondary, tertiary, mobile)
 * @return string
 */
function sticky_mlm_get_menu_classes($context = 'primary') {
    $classes = [
        'primary' => 'mlm-menu mlm-menu--level1',
        'secondary' => 'mlm-menu mlm-menu--level2',
        'tertiary' => 'mlm-menu mlm-menu--level3',
        'mobile' => 'mlm-menu mlm-menu--mobile',
    ];
    
    $class = isset($classes[$context]) ? $classes[$context] : $classes['primary'];
    return apply_filters('sticky_mlm_menu_classes', $class, $context);
}
