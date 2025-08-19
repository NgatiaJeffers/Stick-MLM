<?php
class Sticky_Multilayer_Menu_Admin {
    public function __construct() {
        add_action('admin_menu', [$this, 'add_menu_page']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_notices', [$this, 'show_menu_location_notice']);
    }

    public function add_menu_page() {
        add_menu_page(
            __('Sticky Menu', 'sticky-mlm'),
            __('Sticky Menu', 'sticky-mlm'),
            'manage_options',
            'sticky-mlm',
            [$this, 'settings_page'],
            'dashicons-menu-alt2',
            80
        );
    }

    public function register_settings() {
        // Register settings
        register_setting('stickymlm_settings', 'stickymlm_auto_render');
        register_setting('stickymlm_settings', 'stickymlm_sticky');
        register_setting('stickymlm_settings', 'stickymlm_mobile_breakpoint');
        register_setting('stickymlm_settings', 'stickymlm_hover_delay');
        register_setting('stickymlm_settings', 'stickymlm_debug');
        register_setting(
            'stickymlm_settings',
            'stickymlm_color_scheme',
            [
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default' => 'digicape',
            ]
        );
        register_setting(
            'stickymlm_settings',
            'stickymlm_colors',
            [
                'type' => 'array',
                'sanitize_callback' => [$this, 'sanitize_colors'],
                'default' => [
                    'main_bg' => '#0f2d59',
                    'secondary_bg' => '#5b2c83',
                    'tertiary_bg' => '#401e5a',
                    'secondary_underline' => '#a78bfa',
                    'tertiary_underline' => '#c4b5fd',
                ],
            ]
        );

        // Add settings sections and fields
        add_settings_section(
            'stickymlm_general',
            __('General Settings', 'sticky-mlm'),
            [$this, 'section_callback'],
            'stickymlm_settings'
        );

        add_settings_section(
            'stickymlm_appearance',
            __('Appearance Settings', 'sticky-mlm'),
            [$this, 'appearance_section_callback'],
            'stickymlm_settings'
        );
    }

    /**
     * Sanitize color inputs
     */
    public function sanitize_colors($input) {
        $output = [];
        $keys = ['main_bg', 'secondary_bg', 'tertiary_bg', 'secondary_underline', 'tertiary_underline'];
        foreach ($keys as $key) {
            if (isset($input[$key]) && is_string($input[$key])) {
                $val = trim($input[$key]);
                // Accept hex colors (#RGB, #RRGGBB) and rgba() strings
                if (preg_match('/^#([A-Fa-f0-9]{3}){1,2}$/', $val)) {
                    $output[$key] = $val;
                } elseif (preg_match('/^rgba?\([\d\s.,%]+\)$/', $val)) {
                    $output[$key] = $val;
                }
            }
        }
        return $output;
    }

    public function section_callback() {
        echo '<p>' . __('Configure the general settings for your sticky multi-layer menu.', 'sticky-mlm') . '</p>';
    }

    public function appearance_section_callback() {
        echo '<p>' . __('Customize the appearance and behavior of your menu.', 'sticky-mlm') . '</p>';
    }

    public function settings_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'sticky-mlm'));
        }

        include STICKYMLM_PATH . 'admin/views/settings-page.php';
    }

    public function show_menu_location_notice() {
        $screen = get_current_screen();
        if ($screen->id !== 'toplevel_page_sticky-mlm') {
            return;
        }

        // Check if any menu locations are assigned
        $has_menus = false;
        foreach (['sticky_mlm_main'] as $location) {
            if (has_nav_menu($location)) {
                $has_menus = true;
                break;
            }
        }

        if (!$has_menus) {
            echo '<div class="notice notice-warning is-dismissible">';
            echo '<p>';
            printf(
                __('No menus are assigned to the sticky menu locations yet. %sCreate and assign menus%s to get started.', 'sticky-mlm'),
                '<a href="' . admin_url('nav-menus.php') . '">',
                '</a>'
            );
            echo '</p>';
            echo '</div>';
        }
    }
}
