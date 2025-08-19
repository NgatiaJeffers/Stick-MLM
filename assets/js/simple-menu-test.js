/**
 * Simple vanilla JavaScript version for testing
 * This will help us verify that the WordPress integration works
 * before debugging the React issues
 */

(function() {
    'use strict';
    
    console.log('=== Simple Menu Test Loading ===');
    
    function initSimpleMenu() {
        const container = document.getElementById('sticky-multilayer-menu-root');
        
        if (!container) {
            console.warn('Container not found');
            return;
        }
        
        console.log('Container found:', container);
        console.log('WordPress Data:', window.stickyMLMData);
        
        // Hide fallback menu
        const fallback = container.querySelector('.sticky-multilayer-menu-fallback');
        const reactMount = container.querySelector('.sticky-multilayer-menu-react-mount');
        
        if (fallback) {
            fallback.style.display = 'none';
            console.log('Fallback hidden');
        }
        
        if (reactMount) {
            reactMount.style.display = 'block';
            console.log('React mount shown');
            
            // Create a simple test menu
            const menuData = window.stickyMLMData?.menuData;
            const menuItems = menuData?.items || [];
            
            reactMount.innerHTML = `
                <div style="background: linear-gradient(135deg, #4285f4, #34a853); color: white; padding: 15px; position: sticky; top: 0; z-index: 9999; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 18px; font-weight: bold;">
                            ✅ Sticky Menu Working!
                        </div>
                        <div style="display: flex; gap: 30px; align-items: center;">
                            ${generateMainMenu(menuItems)}
                            <div style="font-size: 12px; opacity: 0.8;">
                                ${menuItems.length} menu items loaded
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Secondary menu container -->
                <div id="secondary-menu-container" style="background: #5a2d82; display: none; position: sticky; top: 60px; z-index: 9998;">
                    <!-- Secondary menus will appear here -->
                </div>
            `;
            
            // Add interactivity
            addMenuInteractivity(reactMount, menuItems);
        }
    }
    
    function generateMainMenu(menuItems) {
        const mainItems = menuItems.filter(item => item.menu_item_parent === '0');
        
        return mainItems.slice(0, 8).map(item => `
            <div style="position: relative;">
                <a href="${item.url}" 
                   data-item-id="${item.ID}"
                   style="color: white; text-decoration: none; padding: 8px 15px; display: block; border-radius: 4px; transition: all 0.3s ease; cursor: pointer;"
                   onmouseover="this.style.background='rgba(255,255,255,0.1)'"
                   onmouseout="this.style.background='transparent'"
                   ${hasChildren(item.ID, menuItems) ? 'data-has-children="true"' : ''}>
                    ${item.title}
                </a>
            </div>
        `).join('');
    }
    
    function hasChildren(parentId, menuItems) {
        return menuItems.some(item => item.menu_item_parent === parentId);
    }
    
    function addMenuInteractivity(container, menuItems) {
        const mainMenuLinks = container.querySelectorAll('[data-has-children="true"]');
        const secondaryContainer = container.querySelector('#secondary-menu-container');
        
        mainMenuLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                const itemId = this.getAttribute('data-item-id');
                const children = menuItems.filter(item => item.menu_item_parent === itemId);
                
                if (children.length > 0) {
                    showSecondaryMenu(children, secondaryContainer);
                }
            });
        });
        
        // Hide secondary menu when not hovering
        container.addEventListener('mouseleave', function() {
            if (secondaryContainer) {
                secondaryContainer.style.display = 'none';
            }
        });
    }
    
    function showSecondaryMenu(items, container) {
        if (!container) return;
        
        container.style.display = 'block';
        container.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; padding: 15px; display: flex; gap: 30px;">
                ${items.map(item => `
                    <a href="${item.url}" 
                       style="color: white; text-decoration: none; padding: 8px 15px; border-radius: 4px; transition: all 0.3s ease; display: block;"
                       onmouseover="this.style.background='rgba(255,255,255,0.1)'"
                       onmouseout="this.style.background='transparent'">
                        ${item.title}
                    </a>
                `).join('')}
            </div>
        `;
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSimpleMenu);
    } else {
        initSimpleMenu();
    }
    
    console.log('Simple menu script loaded');
})();
