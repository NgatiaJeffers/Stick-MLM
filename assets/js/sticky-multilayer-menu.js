/**
 * Sticky Multi-Layer Menu JavaScript - DigiCape Inspired
 * 
 * Features:
 * - Fixed sticky behavior - menus stay open when clicked
 * - Improved state management
 * - DigiCape-style interactions
 * - Enhanced menu hierarchy navigation
 */

(function() {
    'use strict';

    const root = document.getElementById('sticky-mlm');
    if (!root) return;

    // Configuration
    const config = {
        mobileBreakpoint: parseInt(root.dataset.mobileBreakpoint) || 768,
        hoverDelay: 150,
        animationDuration: 300
    };

    // Storage keys for menu state persistence
    const STORAGE_KEYS = {
        MAIN: 'stickymlm_activeMainMenu',
        SECONDARY: 'stickymlm_activeSecondaryMenu', 
        TERTIARY: 'stickymlm_activeTertiaryMenu'
    };

    let isMobile = window.innerWidth <= config.mobileBreakpoint;
    let activeMainItem = null;
    let activeSecondaryItem = null;
    let activeTertiaryItem = null;

    // =============================================================================
    // Utility Functions
    // =============================================================================

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function addClass(element, className) {
        if (element && !element.classList.contains(className)) {
            element.classList.add(className);
        }
    }

    function removeClass(element, className) {
        if (element && element.classList.contains(className)) {
            element.classList.remove(className);
        }
    }

    function getMenuItemTarget(menuItem) {
        // First try data-target attribute (set by Walker)
        if (menuItem.dataset.target) {
            return menuItem.dataset.target;
        }
        
        // Try getting from href
        const link = menuItem.querySelector('a');
        if (link && link.href) {
            const url = link.getAttribute('href');
            if (url && url !== '#') {
                const urlParts = url.split('/');
                const lastPart = urlParts[urlParts.length - 1];
                if (lastPart && lastPart !== '' && !lastPart.startsWith('?')) {
                    return lastPart.replace(/[?#].*$/, ''); // Remove query params and fragments
                }
            }
        }
        
        // Fallback to text content
        const text = menuItem.textContent?.trim()?.toLowerCase().replace(/\s+/g, '-');
        if (text && text.length > 1) {
            return text;
        }
        
        // Last resort - use 'unknown' with some identifier
        return 'unknown-' + (menuItem.id || Math.random().toString(36).substr(2, 9));
    }

    function hasSubmenu(menuItem) {
        const container = menuItem.closest('.menu-item');
        return container && (
            container.querySelector('.mlm-menu--level2') || 
            container.querySelector('.mlm-menu--level3') ||
            container.classList.contains('menu-item-has-children')
        );
    }

    // =============================================================================
    // Menu State Management - FIXED to prevent disappearing
    // =============================================================================

    function setActiveState(item, level) {
        if (!item) return;
        
        // Remove active from siblings at the same level
        const parent = item.parentElement;
        if (parent) {
            parent.querySelectorAll('.menu-item').forEach(sibling => {
                if (sibling !== item) {
                    removeClass(sibling, 'active');
                    removeClass(sibling, 'mlm-item--active');
                }
            });
        }
        
        // Add active to current item
        addClass(item, 'active');
        addClass(item, 'mlm-item--active');
        
        // Store in appropriate variable
        if (level === 'main') {
            activeMainItem = item;
        } else if (level === 'secondary') {
            activeSecondaryItem = item;
        } else if (level === 'tertiary') {
            activeTertiaryItem = item;
        }
    }

    function showSecondaryMenu(mainItem) {
        const secondaryContainer = document.getElementById('mlm-secondary-container');
        if (!secondaryContainer) return;

        const submenu = mainItem.querySelector('.mlm-menu--level2');
        if (!submenu) return;

        const clonedMenu = submenu.cloneNode(true);
        clonedMenu.style.display = 'flex';
        
        secondaryContainer.innerHTML = '<div class="sticky-mlm__container"><nav class="sticky-mlm__nav sticky-mlm__nav--secondary"></nav></div>';
        const navContainer = secondaryContainer.querySelector('.sticky-mlm__nav--secondary');
        navContainer.appendChild(clonedMenu);
        
        secondaryContainer.style.display = 'block';
        secondaryContainer.offsetHeight; // Force reflow
        addClass(secondaryContainer, 'show');
        
        setupSecondaryClickHandlers(navContainer);
    }

    function showTertiaryMenu(secondaryItem) {
        const tertiaryContainer = document.getElementById('mlm-tertiary-container');
        if (!tertiaryContainer) return;

        const tertiaryMenu = secondaryItem.querySelector('.mlm-menu--level3');
        if (!tertiaryMenu) return;

        const clonedTertiary = tertiaryMenu.cloneNode(true);
        clonedTertiary.style.display = 'flex';
        
        tertiaryContainer.innerHTML = '<div class="sticky-mlm__container"><nav class="sticky-mlm__nav sticky-mlm__nav--tertiary"></nav></div>';
        const navContainer = tertiaryContainer.querySelector('.sticky-mlm__nav--tertiary');
        navContainer.appendChild(clonedTertiary);
        
        tertiaryContainer.style.display = 'block';
        tertiaryContainer.offsetHeight; // Force reflow
        addClass(tertiaryContainer, 'show');
        
        setupTertiaryClickHandlers(navContainer);
    }

    function hideSecondaryMenu() {
        const secondaryContainer = document.getElementById('mlm-secondary-container');
        if (secondaryContainer) {
            removeClass(secondaryContainer, 'show');
            setTimeout(() => {
                secondaryContainer.innerHTML = '';
                secondaryContainer.style.display = 'none';
            }, 300);
        }
        activeSecondaryItem = null;
        activeTertiaryItem = null;
    }

    function hideTertiaryMenu() {
        const tertiaryContainer = document.getElementById('mlm-tertiary-container');
        if (tertiaryContainer) {
            removeClass(tertiaryContainer, 'show');
            setTimeout(() => {
                tertiaryContainer.innerHTML = '';
                tertiaryContainer.style.display = 'none';
            }, 300);
        }
        activeTertiaryItem = null;
    }

    // =============================================================================
    // Enhanced Click Handlers - FIXED sticky behavior
    // =============================================================================

    function handleMainNavClick(item, e) {
        const target = getMenuItemTarget(item);
        const isCurrentlyActive = item === activeMainItem;
        const hasSubMenu = hasSubmenu(item);

        console.log('Main nav clicked:', target, 'isCurrentlyActive:', isCurrentlyActive, 'hasSubmenu:', hasSubMenu);

        if (hasSubMenu) {
            e.preventDefault(); // Prevent navigation for items with submenus
            
            if (isCurrentlyActive) {
                // If already active, close all menus
                setActiveState(null, 'main');
                hideSecondaryMenu();
                hideTertiaryMenu();
                activeMainItem = null;
                localStorage.removeItem(STORAGE_KEYS.MAIN);
                localStorage.removeItem(STORAGE_KEYS.SECONDARY);
                localStorage.removeItem(STORAGE_KEYS.TERTIARY);
                localStorage.removeItem('stickymlm_menuHierarchy');
            } else {
                // Activate this item and show submenu
                setActiveState(item, 'main');
                showSecondaryMenu(item);
                localStorage.setItem(STORAGE_KEYS.MAIN, target);
                
                // Clear secondary/tertiary storage
                localStorage.removeItem(STORAGE_KEYS.SECONDARY);
                localStorage.removeItem(STORAGE_KEYS.TERTIARY);
                
                // Save enhanced hierarchy state
                saveMenuHierarchyState();
            }
        } else {
            // No submenu - allow navigation but update state
            setActiveState(item, 'main');
            hideSecondaryMenu();
            hideTertiaryMenu();
            localStorage.setItem(STORAGE_KEYS.MAIN, target);
            localStorage.removeItem(STORAGE_KEYS.SECONDARY);
            localStorage.removeItem(STORAGE_KEYS.TERTIARY);
            localStorage.removeItem('stickymlm_menuHierarchy');
        }
    }

    function handleSecondaryNavClick(item, e) {
        const target = getMenuItemTarget(item);
        const isCurrentlyActive = item === activeSecondaryItem;
        const hasSubMenu = hasSubmenu(item);

        console.log('Secondary nav clicked:', target, 'isCurrentlyActive:', isCurrentlyActive, 'hasSubmenu:', hasSubMenu);

        if (hasSubMenu) {
            e.preventDefault(); // Prevent navigation for items with submenus
            
            if (isCurrentlyActive) {
                // If already active, only close tertiary
                setActiveState(null, 'secondary');
                hideTertiaryMenu();
                localStorage.removeItem(STORAGE_KEYS.SECONDARY);
                localStorage.removeItem(STORAGE_KEYS.TERTIARY);
            } else {
                // Activate this item and show tertiary
                setActiveState(item, 'secondary');
                showTertiaryMenu(item);
                localStorage.setItem(STORAGE_KEYS.SECONDARY, target);
                localStorage.removeItem(STORAGE_KEYS.TERTIARY);
                
                // Auto-activate "All" tertiary item if available
                setTimeout(() => autoActivateAllTertiary(), 100);
            }
        } else {
            // No submenu - allow navigation but update state
            setActiveState(item, 'secondary');
            hideTertiaryMenu();
            localStorage.setItem(STORAGE_KEYS.SECONDARY, target);
            localStorage.removeItem(STORAGE_KEYS.TERTIARY);
        }
        
        // Save enhanced hierarchy state
        saveMenuHierarchyState();
    }

    function handleTertiaryNavClick(item, e) {
        const target = getMenuItemTarget(item);
        
        console.log('Tertiary nav clicked:', target);
        
        // Set active state for tertiary
        setActiveState(item, 'tertiary');
        
        // Ensure parent menus remain active
        if (activeSecondaryItem) addClass(activeSecondaryItem, 'active');
        if (activeMainItem) addClass(activeMainItem, 'active');
        
        localStorage.setItem(STORAGE_KEYS.TERTIARY, target);
        
        // Save enhanced hierarchy state
        saveMenuHierarchyState();
        
        // Allow navigation to proceed
    }

    function autoActivateAllTertiary() {
        const tertiaryContainer = document.getElementById('mlm-tertiary-container');
        if (tertiaryContainer) {
            const allItem = tertiaryContainer.querySelector('.menu-item[data-target="all"], .menu-item a[href*="all"]');
            if (allItem) {
                const menuItem = allItem.classList.contains('menu-item') ? allItem : allItem.closest('.menu-item');
                if (menuItem) {
                    setActiveState(menuItem, 'tertiary');
                    localStorage.setItem(STORAGE_KEYS.TERTIARY, 'all');
                    console.log('Auto-activated "All" tertiary item');
                }
            }
        }
    }

    function setupSecondaryClickHandlers(container) {
        const secondaryItems = container.querySelectorAll('.menu-item');
        secondaryItems.forEach(item => {
            const link = item.querySelector('a');
            if (link) {
                link.addEventListener('click', (e) => handleSecondaryNavClick(item, e));
            }
        });
    }

    function setupTertiaryClickHandlers(container) {
        const tertiaryItems = container.querySelectorAll('.menu-item');
        tertiaryItems.forEach(item => {
            const link = item.querySelector('a');
            if (link) {
                link.addEventListener('click', (e) => handleTertiaryNavClick(item, e));
            }
        });
    }

    // =============================================================================
    // Desktop Menu Initialization
    // =============================================================================

    function initDesktopMenus() {
        if (isMobile) return;

        const mainMenuItems = root.querySelectorAll('.mlm-menu--level1 > .menu-item');
        
        mainMenuItems.forEach(item => {
            const link = item.querySelector('a');
            if (link) {
                link.addEventListener('click', (e) => handleMainNavClick(item, e));
            }
        });

        // Handle clicks outside to close menus
        document.addEventListener('click', (e) => {
            if (!root.contains(e.target)) {
                setActiveState(null, 'main');
                setActiveState(null, 'secondary');  
                setActiveState(null, 'tertiary');
                hideSecondaryMenu();
                hideTertiaryMenu();
                activeMainItem = null;
                activeSecondaryItem = null;
                activeTertiaryItem = null;
            }
        });
    }

    // =============================================================================
    // Mobile Menu Functionality
    // =============================================================================

    function initMobileMenu() {
        const hamburger = root.querySelector('.mlm-hamburger');
        const offcanvas = document.getElementById('mlm-offcanvas');
        const overlay = document.getElementById('mlm-overlay');
        const closeButton = offcanvas?.querySelector('.mlm-offcanvas__close');

        if (!hamburger || !offcanvas || !overlay) return;

        function openMobileMenu() {
            hamburger.setAttribute('aria-expanded', 'true');
            offcanvas.hidden = false;
            overlay.hidden = false;
            document.body.style.overflow = 'hidden';
            addClass(hamburger, 'is-open');
        }

        function closeMobileMenu() {
            hamburger.setAttribute('aria-expanded', 'false');
            offcanvas.hidden = true;
            overlay.hidden = true;
            document.body.style.overflow = '';
            removeClass(hamburger, 'is-open');
        }

        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        closeButton?.addEventListener('click', closeMobileMenu);
        overlay.addEventListener('click', closeMobileMenu);

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !offcanvas.hidden) {
                closeMobileMenu();
            }
        });

        // Handle mobile submenu expansion
        const mobileMenuItems = offcanvas.querySelectorAll('.menu-item-has-children');
        mobileMenuItems.forEach(item => {
            const link = item.querySelector('a');
            const submenu = item.querySelector('ul');
            
            if (!link || !submenu) return;

            const expandButton = document.createElement('button');
            expandButton.className = 'mlm-expand';
            expandButton.type = 'button';
            expandButton.setAttribute('aria-expanded', 'false');
            expandButton.innerHTML = '<span class="mlm-expand-icon">+</span>';
            
            expandButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isExpanded = expandButton.getAttribute('aria-expanded') === 'true';
                
                expandButton.setAttribute('aria-expanded', String(!isExpanded));
                expandButton.querySelector('.mlm-expand-icon').textContent = !isExpanded ? '−' : '+';
                
                if (!isExpanded) {
                    submenu.style.display = 'block';
                    addClass(submenu, 'is-open');
                } else {
                    removeClass(submenu, 'is-open');
                    setTimeout(() => submenu.style.display = 'none', 200);
                }
            });

            item.appendChild(expandButton);
            submenu.style.display = 'none';
        });
    }

    // =============================================================================
    // Scroll Effects
    // =============================================================================

    function handleScroll() {
        if (window.scrollY > 10) {
            addClass(root, 'is-scrolled');
        } else {
            removeClass(root, 'is-scrolled');
        }
    }

    // =============================================================================
    // Responsive Handling
    // =============================================================================

    function handleResize() {
        const wasMobile = isMobile;
        isMobile = window.innerWidth <= config.mobileBreakpoint;

        if (wasMobile !== isMobile) {
            if (!isMobile) {
                // Switched to desktop
                const hamburger = root.querySelector('.mlm-hamburger');
                const offcanvas = document.getElementById('mlm-offcanvas');
                const overlay = document.getElementById('mlm-overlay');
                
                if (hamburger?.getAttribute('aria-expanded') === 'true') {
                    hamburger.setAttribute('aria-expanded', 'false');
                    if (offcanvas) offcanvas.hidden = true;
                    if (overlay) overlay.hidden = true;
                    document.body.style.overflow = '';
                    removeClass(hamburger, 'is-open');
                }
                
                initDesktopMenus();
            } else {
                // Switched to mobile - hide desktop menus
                hideSecondaryMenu();
                hideTertiaryMenu();
                activeMainItem = null;
                activeSecondaryItem = null;
                activeTertiaryItem = null;
            }
        }
    }

    // =============================================================================
    // State Restoration - Enhanced for reliable page load restoration
    // =============================================================================

    function restoreMenuState() {
        if (isMobile) return;
        
        // Use requestAnimationFrame to ensure DOM is fully rendered
        requestAnimationFrame(() => {
            const mainTarget = localStorage.getItem(STORAGE_KEYS.MAIN);
            const secondaryTarget = localStorage.getItem(STORAGE_KEYS.SECONDARY);
            const tertiaryTarget = localStorage.getItem(STORAGE_KEYS.TERTIARY);

            console.log('Restoring menu state:', { mainTarget, secondaryTarget, tertiaryTarget });

            if (mainTarget) {
                const mainItem = findMenuItemByTarget('.mlm-menu--level1 .menu-item', mainTarget);
                if (mainItem) {
                    console.log('Found main item to restore:', mainItem);
                    
                    // Set active state without navigation
                    setActiveState(mainItem, 'main');
                    
                    // Show secondary menu if main item has children
                    if (hasSubmenu(mainItem)) {
                        showSecondaryMenu(mainItem);
                        
                        // Restore secondary state if available
                        if (secondaryTarget) {
                            // Use a more reliable method to find secondary items
                            requestAnimationFrame(() => {
                                const secondaryItem = findMenuItemInOriginalMenu(mainItem, 'level2', secondaryTarget);
                                if (secondaryItem) {
                                    console.log('Found secondary item to restore:', secondaryItem);
                                    
                                    // Find the corresponding cloned item in the secondary container
                                    const clonedSecondaryItem = findMenuItemByTarget('#mlm-secondary-container .menu-item', secondaryTarget);
                                    if (clonedSecondaryItem) {
                                        setActiveState(clonedSecondaryItem, 'secondary');
                                        
                                        // Show tertiary menu if secondary item has children
                                        if (hasSubmenu(secondaryItem)) {
                                            showTertiaryMenu(clonedSecondaryItem);
                                            
                                            // Restore tertiary state if available
                                            if (tertiaryTarget) {
                                                requestAnimationFrame(() => {
                                                    const clonedTertiaryItem = findMenuItemByTarget('#mlm-tertiary-container .menu-item', tertiaryTarget);
                                                    if (clonedTertiaryItem) {
                                                        console.log('Found tertiary item to restore:', clonedTertiaryItem);
                                                        setActiveState(clonedTertiaryItem, 'tertiary');
                                                    } else {
                                                        console.warn('Could not find tertiary item with target:', tertiaryTarget);
                                                    }
                                                });
                                            }
                                        }
                                    } else {
                                        console.warn('Could not find cloned secondary item with target:', secondaryTarget);
                                    }
                                } else {
                                    console.warn('Could not find original secondary item with target:', secondaryTarget);
                                }
                            });
                        }
                    }
                } else {
                    console.warn('Could not find main item with target:', mainTarget);
                }
            }
        });
    }

    function findMenuItemByTarget(selector, target) {
        const items = document.querySelectorAll(selector);
        for (const item of items) {
            const itemTarget = getMenuItemTarget(item);
            if (itemTarget === target) {
                return item;
            }
        }
        return null;
    }

    /**
     * Find menu item in original menu structure (before cloning)
     * This is more reliable than searching in cloned containers
     */
    function findMenuItemInOriginalMenu(parentItem, level, target) {
        if (!parentItem) return null;
        
        let submenuSelector = '';
        if (level === 'level2') {
            submenuSelector = '.mlm-menu--level2 .menu-item';
        } else if (level === 'level3') {
            submenuSelector = '.mlm-menu--level3 .menu-item';
        }
        
        if (!submenuSelector) return null;
        
        const submenuItems = parentItem.querySelectorAll(submenuSelector);
        for (const item of submenuItems) {
            const itemTarget = getMenuItemTarget(item);
            if (itemTarget === target) {
                return item;
            }
        }
        return null;
    }

    /**
     * Enhanced state persistence - save full menu hierarchy path
     */
    function saveMenuHierarchyState() {
        try {
            const hierarchy = {
                main: activeMainItem ? getMenuItemTarget(activeMainItem) : null,
                secondary: activeSecondaryItem ? getMenuItemTarget(activeSecondaryItem) : null,
                tertiary: activeTertiaryItem ? getMenuItemTarget(activeTertiaryItem) : null,
                timestamp: Date.now()
            };
            
            localStorage.setItem('stickymlm_menuHierarchy', JSON.stringify(hierarchy));
            console.log('Saved menu hierarchy:', hierarchy);
            
            // Also save individual items for backward compatibility
            if (hierarchy.main) localStorage.setItem(STORAGE_KEYS.MAIN, hierarchy.main);
            if (hierarchy.secondary) localStorage.setItem(STORAGE_KEYS.SECONDARY, hierarchy.secondary);
            if (hierarchy.tertiary) localStorage.setItem(STORAGE_KEYS.TERTIARY, hierarchy.tertiary);
            
        } catch (error) {
            console.warn('Could not save menu hierarchy to localStorage:', error);
        }
    }

    /**
     * Enhanced state restoration using hierarchy data
     */
    function restoreMenuHierarchy() {
        if (isMobile) return;
        
        const hierarchyData = localStorage.getItem('stickymlm_menuHierarchy');
        if (!hierarchyData) return;
        
        try {
            const hierarchy = JSON.parse(hierarchyData);
            
            // Check if data is not too old (24 hours)
            if (Date.now() - hierarchy.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('stickymlm_menuHierarchy');
                return;
            }
            
            console.log('Restoring menu hierarchy from enhanced data:', hierarchy);
            
            if (hierarchy.main) {
                const mainItem = findMenuItemByTarget('.mlm-menu--level1 .menu-item', hierarchy.main);
                if (mainItem && hasSubmenu(mainItem)) {
                    setActiveState(mainItem, 'main');
                    showSecondaryMenu(mainItem);
                    
                    if (hierarchy.secondary) {
                        requestAnimationFrame(() => {
                            const secondaryItem = findMenuItemByTarget('#mlm-secondary-container .menu-item', hierarchy.secondary);
                            if (secondaryItem) {
                                const originalSecondaryItem = findMenuItemInOriginalMenu(mainItem, 'level2', hierarchy.secondary);
                                if (originalSecondaryItem && hasSubmenu(originalSecondaryItem)) {
                                    setActiveState(secondaryItem, 'secondary');
                                    showTertiaryMenu(secondaryItem);
                                    
                                    if (hierarchy.tertiary) {
                                        requestAnimationFrame(() => {
                                            const tertiaryItem = findMenuItemByTarget('#mlm-tertiary-container .menu-item', hierarchy.tertiary);
                                            if (tertiaryItem) {
                                                setActiveState(tertiaryItem, 'tertiary');
                                            }
                                        });
                                    }
                                } else if (originalSecondaryItem) {
                                    // Secondary item exists but has no submenu
                                    setActiveState(secondaryItem, 'secondary');
                                }
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error restoring menu hierarchy:', error);
            localStorage.removeItem('stickymlm_menuHierarchy');
        }
    }

    /**
     * Detect current page and auto-activate corresponding menu items
     * Enhanced to work with WordPress current-menu-item classes
     */
    function detectCurrentPageMenu() {
        console.log('Detecting current page menu...');
        
        // First, try to find WordPress current menu items
        const currentMenuItem = document.querySelector('.mlm-menu .current-menu-item, .mlm-menu .current-menu-ancestor, .mlm-menu .current-menu-parent');
        if (currentMenuItem) {
            console.log('Found WordPress current menu item:', currentMenuItem);
            activateMenuHierarchyForItem(currentMenuItem);
            return true;
        }
        
        // Fallback to URL-based detection
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'home';
        
        console.log('Using URL-based detection for:', currentPage);
        
        // Look for matching menu items across all levels
        const allMenuItems = document.querySelectorAll('.sticky-mlm .menu-item a');
        
        for (const link of allMenuItems) {
            const href = link.getAttribute('href');
            if (href && (href.includes(currentPath) || href.endsWith('/' + currentPage))) {
                const menuItem = link.closest('.menu-item');
                if (menuItem) {
                    const target = getMenuItemTarget(menuItem);
                    console.log('Found matching menu item for current page:', target);
                    
                    // Determine which level this item belongs to and activate hierarchy
                    activateMenuHierarchyForItem(menuItem);
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Activate the full menu hierarchy for a given menu item
     * Enhanced to handle WordPress current classes
     */
    function activateMenuHierarchyForItem(menuItem) {
        console.log('Activating menu hierarchy for item:', menuItem);
        
        // Determine the level of this menu item
        const isLevel1 = menuItem.closest('.mlm-menu--level1');
        const isLevel2 = menuItem.closest('.mlm-menu--level2');
        const isLevel3 = menuItem.closest('.mlm-menu--level3');
        
        // Find the level 1 parent
        let level1Item = null;
        if (isLevel1) {
            level1Item = menuItem;
        } else if (isLevel2) {
            // Find the level1 item that contains this level2 menu
            level1Item = document.querySelector('.mlm-menu--level1 .menu-item-has-children');
            const level2Menus = level1Item?.querySelectorAll('.mlm-menu--level2');
            level2Menus?.forEach(menu => {
                if (menu.contains(menuItem)) {
                    level1Item = menu.closest('.mlm-menu--level1 .menu-item');
                }
            });
        } else if (isLevel3) {
            // Find level1 and level2 parents
            level1Item = document.querySelector('.mlm-menu--level1 .menu-item-has-children');
            // This is more complex, need to traverse up
        }
        
        // For now, let's use a simpler approach - look for parent items with current-menu-ancestor class
        const level1Current = document.querySelector('.mlm-menu--level1 .current-menu-item, .mlm-menu--level1 .current-menu-ancestor, .mlm-menu--level1 .current-menu-parent');
        const level2Current = document.querySelector('.mlm-menu--level2 .current-menu-item, .mlm-menu--level2 .current-menu-ancestor, .mlm-menu--level2 .current-menu-parent');
        const level3Current = document.querySelector('.mlm-menu--level3 .current-menu-item');
        
        if (level1Current) {
            console.log('Activating level 1:', level1Current);
            setActiveState(level1Current, 'main');
            
            if (hasSubmenu(level1Current)) {
                showSecondaryMenu(level1Current);
                
                // Wait for secondary menu to be created, then check for level 2
                setTimeout(() => {
                    if (level2Current) {
                        const level2Target = getMenuItemTarget(level2Current);
                        const clonedLevel2 = findMenuItemByTarget('#mlm-secondary-container .menu-item', level2Target);
                        if (clonedLevel2) {
                            console.log('Activating level 2:', clonedLevel2);
                            setActiveState(clonedLevel2, 'secondary');
                            
                            if (hasSubmenu(level2Current)) {
                                showTertiaryMenu(clonedLevel2);
                                
                                // Wait for tertiary menu, then check for level 3
                                setTimeout(() => {
                                    if (level3Current) {
                                        const level3Target = getMenuItemTarget(level3Current);
                                        const clonedLevel3 = findMenuItemByTarget('#mlm-tertiary-container .menu-item', level3Target);
                                        if (clonedLevel3) {
                                            console.log('Activating level 3:', clonedLevel3);
                                            setActiveState(clonedLevel3, 'tertiary');
                                        }
                                    }
                                    saveMenuHierarchyState();
                                }, 100);
                            } else {
                                saveMenuHierarchyState();
                            }
                        }
                    }
                }, 100);
            } else {
                saveMenuHierarchyState();
            }
        }
    }

    // =============================================================================
    // Initialization
    // =============================================================================

    function init() {
        console.log('Initializing Enhanced Sticky MLM Menu...');
        
        initMobileMenu();
        
        if (!isMobile) {
            initDesktopMenus();
        }
        
        // Scroll effects
        handleScroll();
        window.addEventListener('scroll', debounce(handleScroll, 10), { passive: true });
        
        // Responsive handling
        window.addEventListener('resize', debounce(handleResize, 250));
        
        addClass(root, 'sticky-mlm--initialized');
        
        // Restore menu state with multiple fallback methods
        const hierarchyData = localStorage.getItem('stickymlm_menuHierarchy');
        if (hierarchyData) {
            console.log('Using enhanced hierarchy restoration');
            restoreMenuHierarchy();
        } else {
            console.log('Using legacy restoration method');
            restoreMenuState();
        }
        
        // Always try current page detection as it's most reliable for WordPress
        setTimeout(() => {
            console.log('Running current page detection...');
            if (!detectCurrentPageMenu()) {
                console.log('Current page detection found no matches');
            }
        }, 200);
        
        console.log('Enhanced Sticky MLM Menu initialized successfully');
    }

    /**
     * Early detection that runs as soon as possible
     */
    function earlyCurrentPageDetection() {
        if (isMobile) return;
        
        console.log('Running early current page detection...');
        
        // Look for WordPress current classes immediately
        const currentItems = document.querySelectorAll('.current-menu-item, .current-menu-ancestor, .current-menu-parent');
        if (currentItems.length > 0) {
            console.log('Found', currentItems.length, 'current menu items');
            
            // Find the main level item with current class
            const mainCurrentItem = document.querySelector('.mlm-menu--level1 .current-menu-item, .mlm-menu--level1 .current-menu-ancestor, .mlm-menu--level1 .current-menu-parent');
            if (mainCurrentItem) {
                console.log('Early detection found main current item:', mainCurrentItem);
                
                // Set basic active state
                addClass(mainCurrentItem, 'active');
                addClass(mainCurrentItem, 'mlm-item--active');
                activeMainItem = mainCurrentItem;
                
                // If it has submenu, show it
                if (hasSubmenu(mainCurrentItem)) {
                    const secondaryContainer = document.getElementById('mlm-secondary-container');
                    if (secondaryContainer) {
                        const submenu = mainCurrentItem.querySelector('.mlm-menu--level2');
                        if (submenu) {
                            const clonedMenu = submenu.cloneNode(true);
                            clonedMenu.style.display = 'flex';
                            
                            secondaryContainer.innerHTML = '<div class="sticky-mlm__container"><nav class="sticky-mlm__nav sticky-mlm__nav--secondary"></nav></div>';
                            const navContainer = secondaryContainer.querySelector('.sticky-mlm__nav--secondary');
                            navContainer.appendChild(clonedMenu);
                            
                            secondaryContainer.style.display = 'block';
                            addClass(secondaryContainer, 'show');
                            setupSecondaryClickHandlers(navContainer);
                            
                            // Check for secondary level current items
                            const secondaryCurrentItem = document.querySelector('.mlm-menu--level2 .current-menu-item, .mlm-menu--level2 .current-menu-ancestor, .mlm-menu--level2 .current-menu-parent');
                            if (secondaryCurrentItem) {
                                const secondaryTarget = getMenuItemTarget(secondaryCurrentItem);
                                const clonedSecondaryItem = navContainer.querySelector(`[data-target="${secondaryTarget}"]`);
                                if (clonedSecondaryItem) {
                                    addClass(clonedSecondaryItem, 'active');
                                    addClass(clonedSecondaryItem, 'mlm-item--active');
                                    activeSecondaryItem = clonedSecondaryItem;
                                    
                                    // If secondary has submenu, show tertiary
                                    if (hasSubmenu(secondaryCurrentItem)) {
                                        const tertiaryContainer = document.getElementById('mlm-tertiary-container');
                                        if (tertiaryContainer) {
                                            const tertiaryMenu = secondaryCurrentItem.querySelector('.mlm-menu--level3');
                                            if (tertiaryMenu) {
                                                const clonedTertiary = tertiaryMenu.cloneNode(true);
                                                clonedTertiary.style.display = 'flex';
                                                
                                                tertiaryContainer.innerHTML = '<div class="sticky-mlm__container"><nav class="sticky-mlm__nav sticky-mlm__nav--tertiary"></nav></div>';
                                                const tertiaryNavContainer = tertiaryContainer.querySelector('.sticky-mlm__nav--tertiary');
                                                tertiaryNavContainer.appendChild(clonedTertiary);
                                                
                                                tertiaryContainer.style.display = 'block';
                                                addClass(tertiaryContainer, 'show');
                                                
                                                setupTertiaryClickHandlers(tertiaryNavContainer);
                                                
                                                // Check for tertiary current item
                                                const tertiaryCurrentItem = document.querySelector('.mlm-menu--level3 .current-menu-item');
                                                if (tertiaryCurrentItem) {
                                                    const tertiaryTarget = getMenuItemTarget(tertiaryCurrentItem);
                                                    const clonedTertiaryItem = tertiaryNavContainer.querySelector(`[data-target="${tertiaryTarget}"]`);
                                                    if (clonedTertiaryItem) {
                                                        addClass(clonedTertiaryItem, 'active');
                                                        addClass(clonedTertiaryItem, 'mlm-item--active');
                                                        activeTertiaryItem = clonedTertiaryItem;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                // Save the state
                setTimeout(() => {
                    saveMenuHierarchyState();
                }, 100);
            }
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            earlyCurrentPageDetection();
            init();
        });
    } else {
        earlyCurrentPageDetection();
        init();
    }

    // Also run early detection immediately if DOM is already loaded
    if (document.readyState !== 'loading') {
        setTimeout(earlyCurrentPageDetection, 50);
    }

    // Expose public API with enhanced debugging
    window.StickyMLM = window.StickyMLM || {};
    window.StickyMLM.refresh = init;
    window.StickyMLM.hideAllMenus = () => {
        hideSecondaryMenu();
        hideTertiaryMenu();
    };
    window.StickyMLM.debugMenuState = () => {
        console.log('Current Menu State:', {
            activeMainItem: activeMainItem ? getMenuItemTarget(activeMainItem) : null,
            activeSecondaryItem: activeSecondaryItem ? getMenuItemTarget(activeSecondaryItem) : null,
            activeTertiaryItem: activeTertiaryItem ? getMenuItemTarget(activeTertiaryItem) : null,
            hierarchyData: localStorage.getItem('stickymlm_menuHierarchy'),
            legacyData: {
                main: localStorage.getItem(STORAGE_KEYS.MAIN),
                secondary: localStorage.getItem(STORAGE_KEYS.SECONDARY),
                tertiary: localStorage.getItem(STORAGE_KEYS.TERTIARY)
            }
        });
    };
    window.StickyMLM.forceRestore = () => {
        console.log('Force restoring menu state...');
        restoreMenuHierarchy();
    };
    window.StickyMLM.clearState = () => {
        localStorage.removeItem('stickymlm_menuHierarchy');
        localStorage.removeItem(STORAGE_KEYS.MAIN);
        localStorage.removeItem(STORAGE_KEYS.SECONDARY);
        localStorage.removeItem(STORAGE_KEYS.TERTIARY);
        console.log('Menu state cleared');
    };

    // =============================================================================
    // Safety Check - Remove stray overlays that might block interaction
    // =============================================================================
    
    const removeStrayOverlays = () => {
        const strayOverlays = document.querySelectorAll('.mlm-overlay:not([data-menu-id]), .sticky-multilayer-menu__overlay');
        if (strayOverlays.length > 0) {
            console.warn('Found and removing stray menu overlays:', strayOverlays.length);
            strayOverlays.forEach(overlay => {
                // Only remove if not part of an active mobile menu
                if (!overlay.closest('.mlm-offcanvas') && !overlay.getAttribute('aria-hidden')) {
                    overlay.style.display = 'none';
                    overlay.style.pointerEvents = 'none';
                    console.log('Disabled stray overlay');
                }
            });
        }
    };
    
    // Run safety check periodically to catch React-rendered overlays
    setTimeout(removeStrayOverlays, 1000);
    setTimeout(removeStrayOverlays, 3000);
    setTimeout(removeStrayOverlays, 5000);

})();