import React from 'react';
import ReactDOM from 'react-dom/client';
import { StickyMultiLayerMenu } from './Presentation/components/StickyMultiLayerMenu';
import './styles/index.css';

/**
 * Main application entry point
 * Handles hydration of server-rendered menu with React functionality
 */

// Global interfaces for WordPress integration
declare global {
  interface Window {
    stickyMLMData: {
      apiUrl: string;
      nonce: string;
      menuData: any;
      currentUrl: string;
      isWooCommerceActive: boolean;
    };
  }
}

/**
 * Initialize the React application
 */
function initStickyMultiLayerMenu() {
  const container = document.getElementById('sticky-multilayer-menu-root');
  
  if (!container) {
    console.warn('Sticky Multi-Layer Menu: Container element not found');
    return;
  }

  // Check if WordPress data is available - with fallback
  if (!window.stickyMLMData) {
    console.warn('Sticky Multi-Layer Menu: WordPress data not available, creating minimal fallback');
    // Create minimal data structure for development/testing
    window.stickyMLMData = {
      apiUrl: '/wp-json/',
      nonce: '',
      menuData: null,
      currentUrl: window.location.href,
      isWooCommerceActive: false
    };
  }

  console.log('Initializing Sticky Multi-Layer Menu React App');
  console.log('WordPress Data:', window.stickyMLMData);

  // Hide the fallback menu and show React version
  const fallback = container.querySelector('.sticky-multilayer-menu-fallback');
  const reactMount = container.querySelector('.sticky-multilayer-menu-react-mount');
  
  if (fallback) {
    (fallback as HTMLElement).style.display = 'none';
    console.log('Fallback menu hidden');
  }
  
  if (reactMount) {
    (reactMount as HTMLElement).style.display = 'block';
    console.log('React mount point shown');
  }

  // Create React root and render
  const targetElement = reactMount || container;
  console.log('Creating React root on:', targetElement);
  
  try {
    const root = ReactDOM.createRoot(targetElement);
    
    // Start with a simple test component to verify React is working
    const TestComponent = () => (
      <div style={{
        background: '#4285f4',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 9999
      }}>
        <h2>✅ React Menu Loading Successfully!</h2>
        <p>WordPress Data: {window.stickyMLMData?.menuData ? 'Available' : 'Not Available'}</p>
        <p>Menu Items: {window.stickyMLMData?.menuData?.items?.length || 0}</p>
        <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.9 }}>
          This will be replaced by the full menu component once everything is working.
        </div>
      </div>
    );
    
    root.render(
      <React.StrictMode>
        <TestComponent />
      </React.StrictMode>
    );
    
    // After 3 seconds, try to load the full component
    setTimeout(() => {
      try {
        root.render(
          <React.StrictMode>
            <StickyMultiLayerMenu 
              apiUrl={window.stickyMLMData.apiUrl}
              nonce={window.stickyMLMData.nonce}
              initialMenuData={window.stickyMLMData.menuData}
              currentUrl={window.stickyMLMData.currentUrl}
              isWooCommerceActive={window.stickyMLMData.isWooCommerceActive}
            />
          </React.StrictMode>
        );
        console.log('Full React app loaded after delay');
      } catch (fullError) {
        console.error('Error loading full app:', fullError);
        // Keep the test component if full app fails
      }
    }, 3000);
    
    console.log('React test component rendered successfully');
  } catch (error) {
    console.error('Error rendering React app:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStickyMultiLayerMenu);
} else {
  initStickyMultiLayerMenu();
}

// Export for potential manual initialization
export { initStickyMultiLayerMenu };
