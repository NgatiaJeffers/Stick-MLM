<?php
/**
 * Debug helper to check menu loading status
 * Temporary file to help debug menu loading issues
 */

if (!defined('ABSPATH')) {
    // For direct access testing
    require_once '../../../wp-load.php';
}

echo "<h2>Sticky MLM Menu Debug Status</h2>";

// 1. Check if plugin is active
echo "<h3>1. Plugin Status</h3>";
echo "Plugin active: " . (class_exists('Sticky_Multilayer_Menu') ? "✅ Yes" : "❌ No") . "<br>";

// 2. Check menu locations
echo "<h3>2. Menu Locations</h3>";
$registered_locations = get_registered_nav_menus();
echo "Registered locations:<br>";
foreach ($registered_locations as $location => $description) {
    echo "- {$location}: {$description}<br>";
}

$nav_menu_locations = get_nav_menu_locations();
echo "<br>Assigned menu locations:<br>";
if (empty($nav_menu_locations)) {
    echo "❌ No menus assigned to any locations<br>";
} else {
    foreach ($nav_menu_locations as $location => $menu_id) {
        $menu = wp_get_nav_menu_object($menu_id);
        $menu_name = $menu ? $menu->name : 'Unknown';
        echo "- {$location}: Menu ID {$menu_id} ({$menu_name})<br>";
    }
}

// 3. Check specific sticky_mlm_main location
echo "<h3>3. Sticky MLM Main Menu Location</h3>";
$has_sticky_menu = has_nav_menu('sticky_mlm_main');
echo "Has sticky_mlm_main menu: " . ($has_sticky_menu ? "✅ Yes" : "❌ No") . "<br>";

if ($has_sticky_menu) {
    $locations = get_nav_menu_locations();
    $menu_id = $locations['sticky_mlm_main'];
    $menu = wp_get_nav_menu_object($menu_id);
    echo "Menu assigned: {$menu->name} (ID: {$menu_id})<br>";
    
    $menu_items = wp_get_nav_menu_items($menu_id);
    echo "Menu items count: " . count($menu_items) . "<br>";
    
    if (!empty($menu_items)) {
        echo "First 5 menu items:<br>";
        foreach (array_slice($menu_items, 0, 5) as $item) {
            echo "- {$item->title} (Level: " . ($item->menu_item_parent ? "Child" : "Parent") . ")<br>";
        }
    }
}

// 4. Check React build files
echo "<h3>4. React Build Files</h3>";
$manifest_path = plugin_dir_path(__FILE__) . 'assets/react-build/manifest.json';
echo "Manifest path: {$manifest_path}<br>";
echo "Manifest exists: " . (file_exists($manifest_path) ? "✅ Yes" : "❌ No") . "<br>";

if (file_exists($manifest_path)) {
    $manifest = json_decode(file_get_contents($manifest_path), true);
    echo "Manifest valid: " . ($manifest ? "✅ Yes" : "❌ No") . "<br>";
    
    if ($manifest && isset($manifest['src/main.tsx'])) {
        echo "Main entry exists: ✅ Yes<br>";
        $main_entry = $manifest['src/main.tsx'];
        echo "JS file: assets/react-build/{$main_entry['file']}<br>";
        
        $js_path = plugin_dir_path(__FILE__) . 'assets/react-build/' . $main_entry['file'];
        echo "JS file exists: " . (file_exists($js_path) ? "✅ Yes" : "❌ No") . "<br>";
        
        if (isset($main_entry['css'])) {
            foreach ($main_entry['css'] as $css_file) {
                $css_path = plugin_dir_path(__FILE__) . 'assets/react-build/' . $css_file;
                echo "CSS file exists ({$css_file}): " . (file_exists($css_path) ? "✅ Yes" : "❌ No") . "<br>";
            }
        }
    } else {
        echo "Main entry missing: ❌ No<br>";
    }
}

// 5. Check if assets are enqueued
echo "<h3>5. Enqueued Assets (Frontend Only)</h3>";
if (is_admin()) {
    echo "Run this on the frontend to see enqueued assets<br>";
} else {
    global $wp_scripts, $wp_styles;
    
    $sticky_scripts = array_filter($wp_scripts->registered, function($handle) {
        return strpos($handle, 'sticky') !== false;
    }, ARRAY_FILTER_USE_KEY);
    
    echo "Sticky-related scripts: " . (empty($sticky_scripts) ? "❌ None" : "✅ " . implode(', ', array_keys($sticky_scripts))) . "<br>";
    
    $sticky_styles = array_filter($wp_styles->registered, function($handle) {
        return strpos($handle, 'sticky') !== false;
    }, ARRAY_FILTER_USE_KEY);
    
    echo "Sticky-related styles: " . (empty($sticky_styles) ? "❌ None" : "✅ " . implode(', ', array_keys($sticky_styles))) . "<br>";
}

// 6. Check current page context
echo "<h3>6. Current Page Context</h3>";
echo "Is frontend: " . (!is_admin() ? "✅ Yes" : "❌ No") . "<br>";
echo "Current URL: " . (isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : 'Unknown') . "<br>";

// 7. Check theme compatibility
echo "<h3>7. Theme Compatibility</h3>";
$theme = wp_get_theme();
echo "Active theme: {$theme->get('Name')} v{$theme->get('Version')}<br>";
echo "wp_footer action exists: " . (has_action('wp_footer') ? "✅ Yes" : "❌ No") . "<br>";
echo "Body class filter exists: " . (has_filter('body_class') ? "✅ Yes" : "❌ No") . "<br>";

// 8. Settings check
echo "<h3>8. Plugin Settings</h3>";
$auto_render = get_option('stickymlm_auto_render', true);
echo "Auto render: " . ($auto_render ? "✅ Enabled" : "❌ Disabled") . "<br>";

$sticky_enabled = get_option('stickymlm_sticky', true);
echo "Sticky behavior: " . ($sticky_enabled ? "✅ Enabled" : "❌ Disabled") . "<br>";

echo "<hr>";
echo "<p><strong>Next Steps:</strong></p>";
echo "<ul>";
if (!$has_sticky_menu) {
    echo "<li>❗ <strong>Create a menu and assign it to 'Sticky MLM: Main Menu' location</strong></li>";
}
if (!file_exists($manifest_path)) {
    echo "<li>❗ Build the React application by running 'npm run build' in the react-menu folder</li>";
}
echo "<li>Check the browser console for JavaScript errors</li>";
echo "<li>Verify the menu container appears in the page source</li>";
echo "</ul>";
