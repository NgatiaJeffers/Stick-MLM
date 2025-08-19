<?php
/**
 * Plugin Name: Sticky Multi-Layer Menu (React)
 * Description: A modern React-based sticky menu plugin for WordPress/WooCommerce with hierarchical navigation (Main → Secondary → Tertiary levels). Features progressive enhancement, domain-driven design, and WooCommerce integration.
 * Version:     2.0.0
 * Author:      Jefferson Gakuya
 * Text Domain: sticky-multilayer-menu
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
 * License: GPL v2 or later
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Autoload includes (or require manually if not using Composer)
require_once plugin_dir_path(__FILE__) . 'includes/class-sticky-multilayer-menu.php';

// Bootstrap
add_action('plugins_loaded', function() {
    Sticky_Multilayer_Menu::get_instance();
});

// Template function for manual placement
function sticky_multilayer_menu_render($args = []) {
    if (class_exists('Sticky_Multilayer_Menu_Renderer')) {
        $renderer = new Sticky_Multilayer_Menu_Renderer();
        $renderer->render($args);
    }
}

// Register REST API endpoints
add_action('rest_api_init', function() {
    if (class_exists('Sticky_Multilayer_Menu_API')) {
        $api = new Sticky_Multilayer_Menu_API();
        $api->register_routes();
    }
});

// Debug mode - add ?sticky_mlm_debug=1 to any page URL
add_action('wp_footer', function() {
    if (isset($_GET['sticky_mlm_debug']) && current_user_can('manage_options')) {
        echo '<div id="sticky-mlm-debug" style="position: fixed; bottom: 0; left: 0; background: #000; color: #fff; padding: 20px; z-index: 99999; max-width: 500px; font-size: 12px; line-height: 1.4;">';
        echo '<h4 style="margin: 0 0 10px; color: #fff;">Sticky MLM Debug Info</h4>';
        
        // Check menu assignment
        $has_menu = has_nav_menu('sticky_mlm_main');
        echo '<p><strong>Menu assigned to sticky_mlm_main:</strong> ' . ($has_menu ? '✅ Yes' : '❌ No') . '</p>';
        
        if ($has_menu) {
            $locations = get_nav_menu_locations();
            $menu = wp_get_nav_menu_object($locations['sticky_mlm_main']);
            echo '<p><strong>Menu name:</strong> ' . $menu->name . '</p>';
            $items = wp_get_nav_menu_items($menu->term_id);
            echo '<p><strong>Menu items:</strong> ' . count($items) . '</p>';
        }
        
        // Check React files
        $manifest_path = plugin_dir_path(__FILE__) . 'assets/react-build/manifest.json';
        echo '<p><strong>React manifest exists:</strong> ' . (file_exists($manifest_path) ? '✅ Yes' : '❌ No') . '</p>';
        
        if (file_exists($manifest_path)) {
            $manifest = json_decode(file_get_contents($manifest_path), true);
            $has_main = isset($manifest['src/main.tsx']);
            echo '<p><strong>React main entry:</strong> ' . ($has_main ? '✅ Yes' : '❌ No') . '</p>';
        }
        
        // Check if container exists
        echo '<p><strong>Menu container in DOM:</strong> <span id="debug-container-check">Checking...</span></p>';
        echo '<p><strong>Auto render setting:</strong> ' . (get_option('stickymlm_auto_render', true) ? '✅ Enabled' : '❌ Disabled') . '</p>';
        echo '<p><strong>React mount element:</strong> <span id="debug-react-mount">Checking...</span></p>';
        echo '<p><strong>WordPress data available:</strong> <span id="debug-wp-data">Checking...</span></p>';
        echo '<p><strong>JavaScript errors:</strong> <span id="debug-js-errors">Checking...</span></p>';
        
        echo '<script>
        document.addEventListener("DOMContentLoaded", function() {
            const debug = {
                container: document.getElementById("debug-container-check"),
                reactMount: document.getElementById("debug-react-mount"),
                wpData: document.getElementById("debug-wp-data"),
                jsErrors: document.getElementById("debug-js-errors")
            };
            
            // Check container
            const container = document.getElementById("sticky-multilayer-menu-root");
            if (container) {
                debug.container.innerHTML = "✅ Found (visible: " + (container.offsetParent !== null) + ")";
                debug.container.style.color = "lightgreen";
                
                // Check React mount point
                const reactMount = container.querySelector(".sticky-multilayer-menu-react-mount");
                if (reactMount) {
                    debug.reactMount.innerHTML = "✅ Found (display: " + getComputedStyle(reactMount).display + ")";
                    debug.reactMount.style.color = "lightgreen";
                } else {
                    debug.reactMount.innerHTML = "❌ Not found";
                    debug.reactMount.style.color = "red";
                }
            } else {
                debug.container.innerHTML = "❌ Not found";
                debug.container.style.color = "red";
                debug.reactMount.innerHTML = "❌ Container missing";
                debug.reactMount.style.color = "red";
            }
            
            // Check WordPress data
            if (window.stickyMLMData) {
                debug.wpData.innerHTML = "✅ Available (menuData: " + (window.stickyMLMData.menuData ? "Yes" : "No") + ")";
                debug.wpData.style.color = "lightgreen";
            } else {
                debug.wpData.innerHTML = "❌ Not available";
                debug.wpData.style.color = "red";
            }
            
            // Track JS errors
            let errorCount = 0;
            const originalError = console.error;
            console.error = function(...args) {
                errorCount++;
                debug.jsErrors.innerHTML = "❌ " + errorCount + " error(s) - check console";
                debug.jsErrors.style.color = "red";
                return originalError.apply(console, args);
            };
            
            setTimeout(() => {
                if (errorCount === 0) {
                    debug.jsErrors.innerHTML = "✅ No errors detected";
                    debug.jsErrors.style.color = "lightgreen";
                }
            }, 2000);
        });
        </script>';
        
        echo '<p style="margin-top: 15px;"><a href="' . remove_query_arg('sticky_mlm_debug') . '" style="color: #fff;">Close Debug</a></p>';
        echo '</div>';
    }
}, 99);

// Debug mode - uncomment for troubleshooting
// require_once plugin_dir_path(__FILE__) . 'debug-menu.php';
