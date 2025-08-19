# Sticky Multi-Layer Menu - DigiCape Inspired

## Features

### ✨ Multi-Level Menu Support
- **Main Menu**: Blue sticky bar with primary navigation items
- **Secondary Menu**: Light-colored horizontal bar that appears on hover/active
- **Tertiary Menu**: Additional contextual menu level for deeper navigation

### 🎨 DigiCape-Inspired Design
- Clean, modern interface matching DigiCape's design language
- Blue primary color scheme (#4285f4)
- Smooth hover effects with underline indicators
- Responsive design that works on all devices

### 📱 Mobile Responsive
- Hamburger menu for mobile devices
- Off-canvas navigation panel
- Touch-friendly interactions
- Configurable breakpoint (default: 768px)

### 🛒 WooCommerce Integration
- Cart count badge with real-time updates
- Account login/logout links
- Product search integration
- AJAX cart updates

### ⚙️ WordPress Integration
- Fully manageable via WordPress Dashboard > Appearance > Menus
- One menu location: "Sticky MLM: Main Menu"
- Automatic hierarchy detection (up to 3 levels)
- Theme compatibility

## Setup Instructions

### 1. Install and Activate
1. Upload the plugin to your `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress

### 2. Create Your Menu Structure
Go to **Dashboard > Appearance > Menus** and create a menu with this structure:

```
📁 Shop (Main Level)
├── 📁 Mac (Secondary Level)
│   ├── MacBook Air (Tertiary Level)
│   ├── MacBook Pro (Tertiary Level)
│   └── iMac (Tertiary Level)
├── 📁 iPad (Secondary Level)
│   ├── iPad Pro (Tertiary Level)
│   ├── iPad Air (Tertiary Level)
│   └── iPad mini (Tertiary Level)
└── 📁 iPhone (Secondary Level)
    ├── iPhone 16 Pro (Tertiary Level)
    ├── iPhone 16 (Tertiary Level)
    ├── iPhone 15 (Tertiary Level)
    └── iPhone 14 (Tertiary Level)

📁 Support (Main Level)
├── Contact Us (Secondary Level)
├── FAQ (Secondary Level)
└── Documentation (Secondary Level)

📁 About (Main Level)
└── Our Story (Secondary Level)
```

### 3. Assign Menu Location
1. In the menu editor, assign your menu to **"Sticky MLM: Main Menu"**
2. Save the menu

### 4. Configure Settings
Go to **Dashboard > Sticky Menu** to configure:
- Auto-render on all pages
- Sticky behavior
- Mobile breakpoint
- Hover delay
- Color scheme options

## Usage

### Automatic Display
By default, the menu will automatically appear on all pages if "Auto Render" is enabled.

### Manual Placement
Use the shortcode or template function for custom placement:

**Shortcode:**
```
[sticky_multilayer_menu]
```

**Template Function:**
```php
<?php 
if (function_exists('sticky_mlm_render')) {
    sticky_mlm_render();
} 
?>
```

### Shortcode Parameters
```
[sticky_multilayer_menu sticky="true" mobile_breakpoint="768"]
```

- `sticky` (true/false): Enable sticky behavior
- `mobile_breakpoint` (number): Mobile breakpoint in pixels

## Customization

### CSS Classes
The plugin generates semantic CSS classes for easy customization:

```css
.sticky-mlm                          /* Main container */
.sticky-mlm--sticky                  /* Sticky variant */
.sticky-mlm__row--main              /* Main menu row */
.sticky-mlm__row--secondary         /* Secondary menu row */
.sticky-mlm__row--tertiary          /* Tertiary menu row */
.mlm-menu--level1                   /* Main menu items */
.mlm-menu--level2                   /* Secondary menu items */
.mlm-menu--level3                   /* Tertiary menu items */
.mlm-item--active                   /* Active/current items */
.mlm-item--has-children             /* Items with submenus */
```

### Color Schemes
Choose from preset color schemes or create custom colors:
- **DigiCape Style**: Blue theme matching DigiCape
- **Dark Theme**: Dark background with light text
- **Light Theme**: Clean light theme
- **Custom**: Define your own colors

### Mobile Customization
```css
@media (max-width: 768px) {
    .sticky-mlm__nav--main {
        display: none; /* Hidden on mobile */
    }
    
    .mlm-hamburger {
        display: flex; /* Show hamburger */
    }
}
```

## Hooks and Filters

### Actions
```php
// Before menu render
do_action('sticky_mlm_before_render', $args);

// After menu render  
do_action('sticky_mlm_after_render', $args);

// Before mobile menu render
do_action('sticky_mlm_before_mobile_menu', $args);
```

### Filters
```php
// Modify menu arguments
add_filter('sticky_mlm_menu_args', function($args) {
    $args['depth'] = 2; // Limit to 2 levels
    return $args;
});

// Modify walker class
add_filter('sticky_mlm_walker_class', function($walker_class) {
    return 'My_Custom_Walker';
});

// Modify CSS classes
add_filter('sticky_mlm_css_classes', function($classes) {
    $classes[] = 'my-custom-class';
    return $classes;
});
```

## Advanced Configuration

### Custom Walker
Create a custom walker by extending the base walker:

```php
class My_Custom_Walker extends StickyMLM_Walker {
    // Override methods as needed
}
```

### JavaScript Events
Listen for menu events:

```javascript
// Menu initialized
document.addEventListener('sticky_mlm_initialized', function(e) {
    console.log('Menu initialized', e.detail);
});

// Menu item activated
document.addEventListener('sticky_mlm_item_activated', function(e) {
    console.log('Item activated', e.detail);
});

// Mobile menu opened/closed
document.addEventListener('sticky_mlm_mobile_toggle', function(e) {
    console.log('Mobile menu toggled', e.detail.isOpen);
});
```

## Troubleshooting

### Menu Not Showing
1. Check that a menu is assigned to "Sticky MLM: Main Menu" location
2. Verify "Auto Render" is enabled in settings
3. Check for theme conflicts

### Styling Issues
1. Check CSS specificity conflicts
2. Verify theme compatibility
3. Use browser developer tools to debug

### Mobile Issues
1. Check mobile breakpoint setting
2. Test on actual mobile devices
3. Verify touch interactions work

### WooCommerce Integration
1. Ensure WooCommerce is active
2. Check cart/account page settings
3. Verify AJAX functionality

## Browser Support
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 70+

## Performance
- Minimal CSS/JS footprint (~15KB combined)
- Uses vanilla JavaScript (no jQuery dependency)
- Optimized for Core Web Vitals
- Lazy loading for non-critical resources

## Accessibility
- Full keyboard navigation support
- ARIA labels and roles
- Screen reader compatible
- High contrast mode support
- Focus management

---

**Version:** 1.0.0  
**Author:** Jefferson Gakuya  
**License:** GPL v2 or later
