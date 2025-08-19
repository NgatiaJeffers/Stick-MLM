/**
 * Sticky Multi-Layer Menu - Admin JavaScript
 */

(function($) {
    'use strict';

    function initializeAdmin() {
        console.log('Admin JS initializing...');
        console.log('jQuery available:', typeof $ !== 'undefined');
        console.log('Nav tabs found:', $('.nav-tab').length);
        console.log('Tab contents found:', $('.tab-content').length);
        
        // Simple test alert
        if (typeof $ !== 'undefined' && $('.nav-tab').length > 0) {
            console.log('Setting up tab navigation...');
        }
        
        initTabNavigation();
        initColorSchemeToggle();
        initFormValidation();
    }

    // Multiple initialization attempts
    $(document).ready(initializeAdmin);
    
    // Fallback in case jQuery ready doesn't fire
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof $ !== 'undefined') {
                initializeAdmin();
            }
        });
    } else {
        // DOM already loaded
        setTimeout(function() {
            if (typeof $ !== 'undefined') {
                initializeAdmin();
            }
        }, 100);
    }

    /**
     * Initialize tab navigation functionality
     */
    function initTabNavigation() {
        console.log('initTabNavigation starting...');
        
        // Use vanilla JavaScript first, then jQuery if available
        const tabs = document.querySelectorAll('.nav-tab');
        const contents = document.querySelectorAll('.tab-content');
        
        console.log('Found tabs (vanilla):', tabs.length);
        console.log('Found contents (vanilla):', contents.length);
        
        if (tabs.length === 0 || contents.length === 0) {
            console.log('No tabs or contents found with vanilla JS');
            return;
        }
        
        // Add click handlers to each tab
        tabs.forEach(function(tab, index) {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Tab clicked:', tab.getAttribute('href'));
                
                // Remove active classes from all tabs and contents
                tabs.forEach(function(t) {
                    t.classList.remove('nav-tab-active');
                });
                contents.forEach(function(c) {
                    c.classList.remove('active');
                });
                
                // Add active class to clicked tab
                tab.classList.add('nav-tab-active');
                
                // Show corresponding content
                const targetId = tab.getAttribute('href').substring(1); // Remove #
                const targetContent = document.getElementById(targetId);
                
                console.log('Target ID:', targetId);
                console.log('Target content found:', targetContent !== null);
                
                if (targetContent) {
                    targetContent.classList.add('active');
                    console.log('Active class added to content');
                }
            });
        });
        
        // Handle page load with hash
        if (window.location.hash) {
            const hash = window.location.hash;
            const targetTab = document.querySelector('.nav-tab[href="' + hash + '"]');
            if (targetTab) {
                targetTab.click();
            }
        }
        
        console.log('Tab navigation setup complete');
    }

    /**
     * Initialize color scheme toggle functionality
     */
    function initColorSchemeToggle() {
        const $colorSchemeRadios = $('input[name="stickymlm_color_scheme"]');
        const $customColorsRow = $('.custom-colors');
        
        if ($colorSchemeRadios.length === 0) {
            return;
        }
        
        function toggleCustomColors() {
            const selectedValue = $('input[name="stickymlm_color_scheme"]:checked').val();
            
            if (selectedValue === 'custom' && $customColorsRow.length) {
                $customColorsRow.addClass('show').show();
            } else if ($customColorsRow.length) {
                $customColorsRow.removeClass('show').hide();
            }
        }
        
        $colorSchemeRadios.on('change', toggleCustomColors);
        
        // Initialize on page load
        toggleCustomColors();
    }

    /**
     * Initialize form validation
     */
    function initFormValidation() {
        // Add validation for number inputs
        $('input[type="number"]').on('input', function() {
            const $input = $(this);
            const min = parseInt($input.attr('min'), 10);
            const max = parseInt($input.attr('max'), 10);
            const value = parseInt($input.val(), 10);
            
            if (value < min) {
                $input.val(min);
            } else if (value > max) {
                $input.val(max);
            }
        });

        // Color input validation
        $('input[type="color"]').on('change', function() {
            const $input = $(this);
            const value = $input.val();
            
            // Ensure it's a valid hex color
            if (!/^#[0-9A-F]{6}$/i.test(value)) {
                $input.val('#000000'); // Default fallback
            }
        });
    }

})(jQuery);

// Global test function for debugging
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
    } else {
        console.log('Appearance tab not found');
    }
};
