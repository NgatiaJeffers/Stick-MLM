<?php
/**
 * Sticky Multi-Layer Menu Template - Enhanced DigiCape Inspired
 * 
 * Fixed sticky behavior with improved state management
 */

if (!defined('ABSPATH')) exit;

$stickyClass = $args['sticky'] ? ' sticky-mlm--sticky' : '';
$render = new StickyMLM_Render();
$mobile_breakpoint = isset($args['mobile_breakpoint']) ? intval($args['mobile_breakpoint']) : 768;
?>

<header id="sticky-mlm" class="sticky-mlm<?php echo esc_attr($stickyClass); ?>" role="banner" data-mobile-breakpoint="<?php echo esc_attr($mobile_breakpoint); ?>">
    
    <!-- Main Menu Row (DigiCape Blue Bar - Always Visible) -->
    <div class="sticky-mlm__row sticky-mlm__row--main">
        <div class="sticky-mlm__container">
            <div class="sticky-mlm__brand">
                <a class="sticky-mlm__logo" href="<?php echo esc_url(home_url('/')); ?>" aria-label="<?php bloginfo('name'); ?> - Home">
                    <?php 
                    $custom_logo_id = get_theme_mod('custom_logo');
                    if ($custom_logo_id) {
                        $logo = wp_get_attachment_image_src($custom_logo_id, 'full');
                        echo '<img src="' . esc_url($logo[0]) . '" alt="' . esc_attr(get_bloginfo('name')) . '" height="32">';
                    } else {
                        bloginfo('name');
                    }
                    ?>
                </a>
            </div>

            <nav class="sticky-mlm__nav sticky-mlm__nav--main" aria-label="<?php esc_attr_e('Main navigation','sticky-mlm'); ?>">
                <?php
                if (has_nav_menu('sticky_mlm_main')) {
                    wp_nav_menu([
                        'theme_location' => 'sticky_mlm_main',
                        'container'      => false,
                        'menu_class'     => 'mlm-menu mlm-menu--level1',
                        'fallback_cb'    => false,
                        'depth'          => 3,
                        'walker'         => new Sticky_Multilayer_Menu_Walker(),
                    ]);
                } else {
                    echo '<ul class="mlm-menu mlm-menu--level1">';
                    echo '<li class="menu-item"><a href="' . admin_url('nav-menus.php') . '">' . __('Setup Menu', 'sticky-mlm') . '</a></li>';
                    echo '</ul>';
                }
                ?>
            </nav>

            <div class="sticky-mlm__utils">
                <?php $render->render_search(); ?>
                <?php $render->render_account_link(); ?>
                <?php $render->render_cart_link(); ?>

                <!-- Mobile hamburger -->
                <button class="mlm-hamburger" type="button" aria-controls="mlm-offcanvas" aria-expanded="false" aria-label="<?php esc_attr_e('Toggle navigation menu','sticky-mlm'); ?>">
                    <span class="mlm-hamburger__bar"></span>
                    <span class="mlm-hamburger__bar"></span>
                    <span class="mlm-hamburger__bar"></span>
                    <span class="screen-reader-text"><?php _e('Menu','sticky-mlm'); ?></span>
                </button>
            </div>
        </div>
    </div>

    <!-- Secondary Menu Row (Purple Bar - Shows when main item with submenu is active) -->
    <div class="sticky-mlm__secondary-container" id="mlm-secondary-container" style="display: none;" aria-label="<?php esc_attr_e('Secondary navigation','sticky-mlm'); ?>">
        <!-- Secondary menus will be dynamically inserted here via JavaScript -->
    </div>

    <!-- Tertiary Menu Row (Darker Purple - Shows when secondary item with submenu is active) -->
    <div class="sticky-mlm__tertiary-container" id="mlm-tertiary-container" style="display: none;" aria-label="<?php esc_attr_e('Tertiary navigation','sticky-mlm'); ?>">
        <!-- Tertiary menus will be dynamically inserted here via JavaScript -->
    </div>

</header>

<!-- Mobile Off-canvas Menu -->
<aside id="mlm-offcanvas" class="mlm-offcanvas" hidden aria-label="<?php esc_attr_e('Mobile menu','sticky-mlm'); ?>" role="navigation">
    <div class="mlm-offcanvas__header">
        <h2 class="mlm-offcanvas__title">
            <?php 
            $custom_logo_id = get_theme_mod('custom_logo');
            if ($custom_logo_id) {
                $logo = wp_get_attachment_image_src($custom_logo_id, 'full');
                echo '<img src="' . esc_url($logo[0]) . '" alt="' . esc_attr(get_bloginfo('name')) . '" height="24"> ';
            }
            bloginfo('name'); 
            ?>
        </h2>
        <button class="mlm-offcanvas__close" type="button" aria-label="<?php esc_attr_e('Close menu','sticky-mlm'); ?>">
            ×
        </button>
    </div>
    
    <div class="mlm-offcanvas__body">
        <nav class="mlm-offcanvas__nav">
            <?php
            if (has_nav_menu('sticky_mlm_main')) {
                wp_nav_menu([
                    'theme_location' => 'sticky_mlm_main',
                    'container'      => false,
                    'menu_class'     => 'mlm-menu mlm-menu--mobile',
                    'fallback_cb'    => false,
                    'depth'          => 3,
                ]);
            } else {
                echo '<ul class="mlm-menu mlm-menu--mobile">';
                echo '<li class="menu-item"><a href="' . admin_url('nav-menus.php') . '">' . __('Setup Menu in WordPress Admin','sticky-mlm') . '</a></li>';
                echo '</ul>';
            }
            ?>
        </nav>
        
        <div class="mlm-offcanvas__utils">
            <div class="mlm-offcanvas__search">
                <?php $render->render_search(); ?>
            </div>
            <?php if (class_exists('WooCommerce')) : ?>
                <div class="mlm-offcanvas__woo-links">
                    <?php $render->render_account_link(); ?>
                    <?php $render->render_cart_link(); ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</aside>

<div class="mlm-overlay" id="mlm-overlay" hidden></div>