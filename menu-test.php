<?php
/**
 * Simple test file to check if menu renders
 * Place this file in your theme's root directory and visit it directly
 */

// Load WordPress
require_once('wp-load.php');

// Check if plugin is loaded
if (!class_exists('Sticky_Multilayer_Menu')) {
    echo '<h1>❌ Plugin Not Loaded</h1>';
    echo '<p>The Sticky Multi-Layer Menu plugin is not active or loaded.</p>';
    exit;
}

// Check menu assignment
$has_menu = has_nav_menu('sticky_mlm_main');
if (!$has_menu) {
    echo '<h1>❌ No Menu Assigned</h1>';
    echo '<p>No menu is assigned to the "sticky_mlm_main" location.</p>';
    echo '<p><strong>Solution:</strong> Go to Appearance > Menus and assign a menu to "Sticky MLM: Main Menu" location.</p>';
    exit;
}

// Get menu info
$locations = get_nav_menu_locations();
$menu = wp_get_nav_menu_object($locations['sticky_mlm_main']);
$items = wp_get_nav_menu_items($menu->term_id);

echo '<h1>✅ Menu Test Results</h1>';
echo '<ul>';
echo '<li><strong>Plugin loaded:</strong> Yes</li>';
echo '<li><strong>Menu assigned:</strong> Yes (' . $menu->name . ')</li>';
echo '<li><strong>Menu items:</strong> ' . count($items) . '</li>';
echo '<li><strong>React files built:</strong> ' . (file_exists(plugin_dir_path(__FILE__) . 'wp-content/plugins/sticky-multilayer-menu/assets/react-build/manifest.json') ? 'Yes' : 'No') . '</li>';
echo '</ul>';

echo '<h2>Manual Render Test</h2>';
echo '<p>Below should show the menu if everything works:</p>';

// Manually render the menu
if (function_exists('sticky_multilayer_menu_render')) {
    sticky_multilayer_menu_render();
} else {
    echo '<p>❌ Function sticky_multilayer_menu_render not found</p>';
}

echo '<script>console.log("Menu test page loaded");</script>';
?>
