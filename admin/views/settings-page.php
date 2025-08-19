<?php
/**
 * Admin Settings Page Template - DigiCape Inspired Menu
 */

if (!defined('ABSPATH')) exit;
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <div class="sticky-mlm-admin">
        <div class="sticky-mlm-admin__header">
            <h2><?php _e('Sticky Multi-Layer Menu Settings', 'sticky-mlm'); ?></h2>
            <p><?php _e('Configure your sticky navigation menu with hierarchical levels.', 'sticky-mlm'); ?></p>
        </div>

        <div class="sticky-mlm-admin__info">
            <div class="notice notice-info">
                <h3><?php _e('How It Works', 'sticky-mlm'); ?></h3>
                <ul>
                    <li><?php _e('Create your menu in Appearance > Menus with up to 3 levels of hierarchy', 'sticky-mlm'); ?></li>
                    <li><?php _e('Main menu items appear in the blue sticky bar (like DigiCape)', 'sticky-mlm'); ?></li>
                    <li><?php _e('Secondary menus appear in a light-colored bar below when hovering', 'sticky-mlm'); ?></li>
                    <li><?php _e('Tertiary menus appear in an additional contextual bar', 'sticky-mlm'); ?></li>
                    <li><?php _e('Assign your menu to "Sticky MLM: Main Menu" location', 'sticky-mlm'); ?></li>
                </ul>
                <p><strong>Debug:</strong> <button type="button" id="test-tabs-button" style="margin-left: 10px;">Test Tabs</button></p>
            </div>
        </div>

        <form method="post" action="options.php">
            <?php settings_fields('stickymlm_settings'); ?>
            
            <h2 class="nav-tab-wrapper">
                <a href="#general" class="nav-tab nav-tab-active"><?php _e('General', 'sticky-mlm'); ?></a>
                <a href="#appearance" class="nav-tab"><?php _e('Appearance', 'sticky-mlm'); ?></a>
                <a href="#advanced" class="nav-tab"><?php _e('Advanced', 'sticky-mlm'); ?></a>
            </h2>

            <!-- General Settings -->
            <div id="general" class="tab-content active">
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('Auto Render', 'sticky-mlm'); ?></th>
                        <td>
                            <label for="stickymlm_auto_render">
                                <input 
                                    name="stickymlm_auto_render" 
                                    type="checkbox" 
                                    id="stickymlm_auto_render" 
                                    value="1" 
                                    <?php checked(1, get_option('stickymlm_auto_render', true)); ?> 
                                />
                                <?php _e('Automatically display the menu on all pages', 'sticky-mlm'); ?>
                            </label>
                            <p class="description">
                                <?php _e('If disabled, use shortcode [sticky_multilayer_menu] or template function.', 'sticky-mlm'); ?>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row"><?php _e('Sticky Behavior', 'sticky-mlm'); ?></th>
                        <td>
                            <label for="stickymlm_sticky">
                                <input 
                                    name="stickymlm_sticky" 
                                    type="checkbox" 
                                    id="stickymlm_sticky" 
                                    value="1" 
                                    <?php checked(1, get_option('stickymlm_sticky', true)); ?> 
                                />
                                <?php _e('Make menu sticky (fixed to top when scrolling)', 'sticky-mlm'); ?>
                            </label>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row"><?php _e('Mobile Breakpoint', 'sticky-mlm'); ?></th>
                        <td>
                            <input 
                                name="stickymlm_mobile_breakpoint" 
                                type="number" 
                                id="stickymlm_mobile_breakpoint" 
                                value="<?php echo esc_attr(get_option('stickymlm_mobile_breakpoint', 768)); ?>" 
                                min="320" 
                                max="1200" 
                                step="1"
                            />
                            <span><?php _e('px', 'sticky-mlm'); ?></span>
                            <p class="description">
                                <?php _e('Screen width below which the mobile menu is displayed.', 'sticky-mlm'); ?>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row"><?php _e('Hover Delay', 'sticky-mlm'); ?></th>
                        <td>
                            <input 
                                name="stickymlm_hover_delay" 
                                type="number" 
                                id="stickymlm_hover_delay" 
                                value="<?php echo esc_attr(get_option('stickymlm_hover_delay', 150)); ?>" 
                                min="0" 
                                max="1000" 
                                step="50"
                            />
                            <span><?php _e('ms', 'sticky-mlm'); ?></span>
                            <p class="description">
                                <?php _e('Delay before showing/hiding submenus on hover.', 'sticky-mlm'); ?>
                            </p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Appearance Settings -->
            <div id="appearance" class="tab-content">
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('Color Scheme', 'sticky-mlm'); ?></th>
                        <td>
                            <fieldset>
                                <legend class="screen-reader-text"><?php _e('Color Scheme', 'sticky-mlm'); ?></legend>
                                <label>
                                    <input type="radio" name="stickymlm_color_scheme" value="digicape" <?php checked('digicape', get_option('stickymlm_color_scheme', 'digicape')); ?> />
                                    <?php _e('DigiCape Style (Blue & Purple)', 'sticky-mlm'); ?>
                                </label><br>
                                <label>
                                    <input type="radio" name="stickymlm_color_scheme" value="dark" <?php checked('dark', get_option('stickymlm_color_scheme', 'digicape')); ?> />
                                    <?php _e('Dark Theme', 'sticky-mlm'); ?>
                                </label><br>
                                <label>
                                    <input type="radio" name="stickymlm_color_scheme" value="light" <?php checked('light', get_option('stickymlm_color_scheme', 'digicape')); ?> />
                                    <?php _e('Light Theme', 'sticky-mlm'); ?>
                                </label><br>
                                <label>
                                    <input type="radio" name="stickymlm_color_scheme" value="corporate" <?php checked('corporate', get_option('stickymlm_color_scheme', 'digicape')); ?> />
                                    <?php _e('Corporate (Navy & Amber)', 'sticky-mlm'); ?>
                                </label><br>
                                <label>
                                    <input type="radio" name="stickymlm_color_scheme" value="custom" <?php checked('custom', get_option('stickymlm_color_scheme', 'digicape')); ?> />
                                    <?php _e('Custom Colors', 'sticky-mlm'); ?>
                                </label>
                            </fieldset>
                        </td>
                    </tr>

                    <?php 
                    $colors = get_option('stickymlm_colors', [
                        'main_bg' => '#0f2d59',
                        'secondary_bg' => '#5b2c83',
                        'tertiary_bg' => '#401e5a',
                        'secondary_underline' => '#a78bfa',
                        'tertiary_underline' => '#c4b5fd',
                    ]);
                    
                    // Ensure $colors is always an array
                    if (!is_array($colors)) {
                        $colors = [
                            'main_bg' => '#0f2d59',
                            'secondary_bg' => '#5b2c83',
                            'tertiary_bg' => '#401e5a',
                            'secondary_underline' => '#a78bfa',
                            'tertiary_underline' => '#c4b5fd',
                        ];
                    }
                    
                    // Ensure all required keys exist
                    $colors = wp_parse_args($colors, [
                        'main_bg' => '#0f2d59',
                        'secondary_bg' => '#5b2c83',
                        'tertiary_bg' => '#401e5a',
                        'secondary_underline' => '#a78bfa',
                        'tertiary_underline' => '#c4b5fd',
                    ]);
                    ?>
                    <tr class="custom-colors">
                        <th scope="row"><?php _e('Custom Colors', 'sticky-mlm'); ?></th>
                        <td>
                            <table class="color-table">
                                <tr>
                                    <td><label for="stickymlm_colors_main_bg"><?php _e('Main Background', 'sticky-mlm'); ?></label></td>
                                    <td><input type="color" name="stickymlm_colors[main_bg]" id="stickymlm_colors_main_bg" value="<?php echo esc_attr($colors['main_bg']); ?>" /></td>
                                </tr>
                                <tr>
                                    <td><label for="stickymlm_colors_secondary_bg"><?php _e('Secondary Background', 'sticky-mlm'); ?></label></td>
                                    <td><input type="color" name="stickymlm_colors[secondary_bg]" id="stickymlm_colors_secondary_bg" value="<?php echo esc_attr($colors['secondary_bg']); ?>" /></td>
                                </tr>
                                <tr>
                                    <td><label for="stickymlm_colors_tertiary_bg"><?php _e('Tertiary Background', 'sticky-mlm'); ?></label></td>
                                    <td><input type="color" name="stickymlm_colors[tertiary_bg]" id="stickymlm_colors_tertiary_bg" value="<?php echo esc_attr($colors['tertiary_bg']); ?>" /></td>
                                </tr>
                                <tr>
                                    <td><label for="stickymlm_colors_secondary_underline"><?php _e('Secondary Underline', 'sticky-mlm'); ?></label></td>
                                    <td><input type="color" name="stickymlm_colors[secondary_underline]" id="stickymlm_colors_secondary_underline" value="<?php echo esc_attr($colors['secondary_underline']); ?>" /></td>
                                </tr>
                                <tr>
                                    <td><label for="stickymlm_colors_tertiary_underline"><?php _e('Tertiary Underline', 'sticky-mlm'); ?></label></td>
                                    <td><input type="color" name="stickymlm_colors[tertiary_underline]" id="stickymlm_colors_tertiary_underline" value="<?php echo esc_attr($colors['tertiary_underline']); ?>" /></td>
                                </tr>
                            </table>
                            <p class="description"><?php _e('These apply when the Color Scheme is set to "Custom".', 'sticky-mlm'); ?></p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Advanced Settings -->
            <div id="advanced" class="tab-content">
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('Menu Assignment', 'sticky-mlm'); ?></th>
                        <td>
                            <?php if (has_nav_menu('sticky_mlm_main')): ?>
                                <p class="success"><?php _e('✓ Menu assigned to "Sticky MLM: Main Menu" location', 'sticky-mlm'); ?></p>
                            <?php else: ?>
                                <p class="error"><?php _e('⚠ No menu assigned to "Sticky MLM: Main Menu" location', 'sticky-mlm'); ?></p>
                            <?php endif; ?>
                            <a href="<?php echo admin_url('nav-menus.php'); ?>" class="button">
                                <?php _e('Manage Menus', 'sticky-mlm'); ?>
                            </a>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row"><?php _e('Debug Mode', 'sticky-mlm'); ?></th>
                        <td>
                            <label for="stickymlm_debug">
                                <input 
                                    name="stickymlm_debug" 
                                    type="checkbox" 
                                    id="stickymlm_debug" 
                                    value="1" 
                                    <?php checked(1, get_option('stickymlm_debug', false)); ?> 
                                />
                                <?php _e('Enable debug mode (shows menu structure info)', 'sticky-mlm'); ?>
                            </label>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row"><?php _e('Shortcode', 'sticky-mlm'); ?></th>
                        <td>
                            <code>[sticky_multilayer_menu]</code>
                            <p class="description">
                                <?php _e('Use this shortcode to manually place the menu in posts, pages, or widgets.', 'sticky-mlm'); ?>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row"><?php _e('Template Function', 'sticky-mlm'); ?></th>
                        <td>
                            <code>&lt;?php if (function_exists('sticky_mlm_render')) sticky_mlm_render(); ?&gt;</code>
                            <p class="description">
                                <?php _e('Use this PHP function in your theme templates.', 'sticky-mlm'); ?>
                            </p>
                        </td>
                    </tr>
                </table>
            </div>

            <?php submit_button(); ?>
        </form>

        <div class="sticky-mlm-admin__footer">
            <h3><?php _e('Need Help?', 'sticky-mlm'); ?></h3>
            <p><?php _e('Visit our documentation for setup guides and examples.', 'sticky-mlm'); ?></p>
        </div>
    </div>
</div>

<script>
console.log('Settings page loaded');

// Define the test function inline to ensure it's always available
window.testStickyMLMTabs = function() {
    console.log('=== Tab Navigation Test ===');
    console.log('Tabs found:', document.querySelectorAll('.nav-tab').length);
    console.log('Contents found:', document.querySelectorAll('.tab-content').length);
    console.log('jQuery available:', typeof jQuery !== 'undefined');
    
    // Test clicking the appearance tab
    const appearanceTab = document.querySelector('.nav-tab[href="#appearance"]');
    if (appearanceTab) {
        console.log('Clicking appearance tab...');
        appearanceTab.click();
        console.log('Appearance tab clicked');
    } else {
        console.log('Appearance tab not found');
    }
    
    // Show alert with results
    alert('Tab test completed. Check browser console for details.');
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, testing tab functionality');
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    console.log('Tabs found:', tabs.length);
    console.log('Contents found:', contents.length);
    
    // Handle test button click
    const testButton = document.getElementById('test-tabs-button');
    if (testButton) {
        testButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Test button clicked');
            if (typeof window.testStickyMLMTabs === 'function') {
                window.testStickyMLMTabs();
            } else {
                console.error('testStickyMLMTabs function not found');
                alert('Test function not available');
            }
        });
    }
    
    // Add simple fallback click handlers if the main admin script fails
    tabs.forEach(function(tab) {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Inline handler - tab clicked:', tab.getAttribute('href'));
            
            // Simple tab switching logic as fallback
            const targetId = tab.getAttribute('href').substring(1);
            const targetContent = document.getElementById(targetId);
            
            if (targetContent) {
                // Remove active from all tabs and contents
                tabs.forEach(t => t.classList.remove('nav-tab-active'));
                contents.forEach(c => c.classList.remove('active'));
                
                // Add active to current
                tab.classList.add('nav-tab-active');
                targetContent.classList.add('active');
                
                console.log('Tab switched to:', targetId);
            }
        });
    });
});
</script>
