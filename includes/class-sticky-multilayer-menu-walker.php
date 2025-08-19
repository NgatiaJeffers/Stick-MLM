<?php
/**
 * Custom Walker for Sticky Multi-Layer Menu
 * 
 * This walker handles the rendering of hierarchical menus
 * with support for main -> secondary -> tertiary levels
 */

if (!defined('ABSPATH')) exit;

class Sticky_Multilayer_Menu_Walker extends Walker_Nav_Menu {
    
    /**
     * Start Level - outputs the menu container for each level
     */
    public function start_lvl(&$output, $depth = 0, $args = null) {
        if ($depth === 0) {
            // Secondary menu level - hidden by default, shown via JS cloning
            $output .= '<ul class="mlm-menu mlm-menu--level2" style="display: none;">';
        } elseif ($depth === 1) {
            // Tertiary menu level - hidden by default, shown via JS cloning
            $output .= '<ul class="mlm-menu mlm-menu--level3" style="display: none;">';
        } else {
            // Additional levels (fallback)
            $output .= '<ul class="mlm-submenu mlm-submenu--level' . ($depth + 1) . '">';
        }
    }

    /**
     * End Level - closes the menu container for each level
     */
    public function end_lvl(&$output, $depth = 0, $args = null) {
        $output .= '</ul>';
    }

    /**
     * Start Element - outputs the menu item
     */
    public function start_el(&$output, $item, $depth = 0, $args = null, $id = 0) {
        $classes = empty($item->classes) ? array() : (array) $item->classes;
        $classes[] = 'menu-item-' . $item->ID;

        // Add special classes based on depth
        if ($depth === 0) {
            $classes[] = 'mlm-item--main';
            $classes[] = 'main-nav-item';
        } elseif ($depth === 1) {
            $classes[] = 'mlm-item--secondary';
            $classes[] = 'secondary-nav-item';
        } elseif ($depth === 2) {
            $classes[] = 'mlm-item--tertiary';
            $classes[] = 'tertiary-nav-item';
        }

        // Check if item has children
        $has_children = in_array('menu-item-has-children', $classes);
        if ($has_children) {
            $classes[] = 'mlm-item--has-children';
        }

        // Current item handling
        if (in_array('current-menu-item', $classes) || in_array('current-menu-ancestor', $classes)) {
            $classes[] = 'mlm-item--active';
            $classes[] = 'active';
        }

        $class_names = join(' ', apply_filters('nav_menu_css_class', array_filter($classes), $item, $args));
        $class_names = $class_names ? ' class="' . esc_attr($class_names) . '"' : '';

        $id = apply_filters('nav_menu_item_id', 'menu-item-' . $item->ID, $item, $args);
        $id = $id ? ' id="' . esc_attr($id) . '"' : '';

        // Generate data-target for state management
        $target = '';
        if (!empty($item->url)) {
            $url_parts = parse_url($item->url);
            if (isset($url_parts['path'])) {
                $path_parts = explode('/', trim($url_parts['path'], '/'));
                $target = end($path_parts);
                
                // If target is empty or just numeric, use a more descriptive approach
                if (empty($target) || is_numeric($target)) {
                    $target = sanitize_title($item->title);
                }
            }
        }
        
        // Fallback to menu item ID or title if no reliable target found
        if (empty($target)) {
            $target = sanitize_title($item->title);
        }
        
        // Ensure target is unique by prefixing with menu item ID if needed
        if ($target === 'home' || $target === 'index' || strlen($target) < 2) {
            $target = 'item-' . $item->ID . '-' . $target;
        }

        $data_attributes = ' data-target="' . esc_attr($target) . '"';

        $output .= '<li' . $id . $class_names . $data_attributes . '>';

        $attributes = ! empty($item->attr_title) ? ' title="' . esc_attr($item->attr_title) . '"' : '';
        $attributes .= ! empty($item->target) ? ' target="' . esc_attr($item->target) . '"' : '';
        $attributes .= ! empty($item->xfn) ? ' rel="' . esc_attr($item->xfn) . '"' : '';
        $attributes .= ! empty($item->url) ? ' href="' . esc_attr($item->url) . '"' : '';

        // Add data attributes for JavaScript interaction
        if ($has_children) {
            $attributes .= ' data-mlm-trigger="submenu"';
        }
        if ($depth === 0) {
            $attributes .= ' data-mlm-level="main"';
        } elseif ($depth === 1) {
            $attributes .= ' data-mlm-level="secondary"';
        } elseif ($depth === 2) {
            $attributes .= ' data-mlm-level="tertiary"';
        }

        $item_output = isset($args->before) ? $args->before : '';
        $item_output .= '<a' . $attributes . '>';
        $item_output .= (isset($args->link_before) ? $args->link_before : '') . apply_filters('the_title', $item->title, $item->ID) . (isset($args->link_after) ? $args->link_after : '');
        $item_output .= '</a>';
        $item_output .= isset($args->after) ? $args->after : '';

        $output .= apply_filters('walker_nav_menu_start_el', $item_output, $item, $depth, $args);
    }

    /**
     * End Element - closes the menu item
     */
    public function end_el(&$output, $item, $depth = 0, $args = null) {
        $output .= "</li>";
    }
}
