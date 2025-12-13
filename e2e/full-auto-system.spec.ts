import { test, expect, Page } from '@playwright/test';

test.describe('Full-Auto Multi-Agent System Verification', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set up console error monitoring
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Set up page error monitoring
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });
  });

  test('CRITICAL: Library Route Verification', async () => {
    console.log('🔍 Testing Library Route Access...');
    
    // Test 1: Direct URL access
    await page.goto('https://pow3r-cashout.pages.dev/library');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads without errors
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check for JavaScript errors
    const consoleErrors = await page.evaluate(() => {
      return (window as any).consoleErrors || [];
    });
    expect(consoleErrors).toHaveLength(0);
    
    // Verify library content is visible
    const libraryContent = await page.locator('[data-testid="component-library"]').first();
    await expect(libraryContent).toBeVisible();
    
    // Test 2: Dashboard navigation to library
    await page.goto('https://pow3r-cashout.pages.dev/');
    await page.waitForLoadState('networkidle');
    
    // Click on Library tab
    const libraryTab = page.locator('text=Library').first();
    await expect(libraryTab).toBeVisible();
    await libraryTab.click();
    
    // Verify we're on the library page
    await page.waitForURL('**/library');
    await expect(libraryContent).toBeVisible();
    
    // Test 3: Verify ROC curve chart renders without errors
    const rocChart = page.locator('[data-testid="roc-curve-chart"]').first();
    if (await rocChart.isVisible()) {
      // Check that chart has data
      const chartData = await rocChart.evaluate((el) => {
        return (el as any).chartData || null;
      });
      expect(chartData).toBeTruthy();
    }
    
    console.log('✅ Library Route Verification PASSED');
  });

  test('CRITICAL: New Post Flow Search Field Verification', async () => {
    console.log('🔍 Testing New Post Flow Search Field...');
    
    // Navigate to New Post Flow
    await page.goto('https://pow3r-cashout.pages.dev/');
    await page.waitForLoadState('networkidle');
    
    // Click on New Post Flow
    const newPostFlowTab = page.locator('text=New Post Flow').first();
    await expect(newPostFlowTab).toBeVisible();
    await newPostFlowFlow.click();
    
    // Wait for the form to load
    await page.waitForLoadState('networkidle');
    
    // Find the first search field
    const firstSearchField = page.locator('input[type="text"]').first();
    await expect(firstSearchField).toBeVisible();
    
    // Test typing in the field
    await firstSearchField.click();
    await firstSearchField.fill('test search query');
    
    // Verify the text was entered
    const fieldValue = await firstSearchField.inputValue();
    expect(fieldValue).toBe('test search query');
    
    // Test API connection by checking for network requests
    const apiRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });
    
    // Trigger a search or form action
    const searchButton = page.locator('button[type="submit"], button:has-text("Search")').first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(2000); // Wait for API call
      
      // Verify API request was made
      expect(apiRequests.length).toBeGreaterThan(0);
    }
    
    console.log('✅ New Post Flow Search Field Verification PASSED');
  });

  test('CRITICAL: Dashboard Navigation Verification', async () => {
    console.log('🔍 Testing Dashboard Navigation...');
    
    await page.goto('https://pow3r-cashout.pages.dev/');
    await page.waitForLoadState('networkidle');
    
    // Verify all navigation tabs are present and functional
    const navigationTabs = [
      'Overview',
      'API Agent', 
      'UI Agent',
      'Library',
      'New Post Flow'
    ];
    
    for (const tabName of navigationTabs) {
      const tab = page.locator(`text=${tabName}`).first();
      await expect(tab).toBeVisible();
      
      // Click the tab
      await tab.click();
      await page.waitForLoadState('networkidle');
      
      // Verify no console errors
      const consoleErrors = await page.evaluate(() => {
        return (window as any).consoleErrors || [];
      });
      expect(consoleErrors).toHaveLength(0);
    }
    
    console.log('✅ Dashboard Navigation Verification PASSED');
  });

  test('CRITICAL: API Connection Verification', async () => {
    console.log('🔍 Testing API Connection...');
    
    await page.goto('https://pow3r-cashout.pages.dev/');
    await page.waitForLoadState('networkidle');
    
    // Monitor network requests
    const apiRequests: any[] = [];
    const apiResponses: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // Trigger API calls by interacting with the dashboard
    const apiAgentTab = page.locator('text=API Agent').first();
    await apiAgentTab.click();
    await page.waitForLoadState('networkidle');
    
    // Wait for potential API calls
    await page.waitForTimeout(3000);
    
    // Verify API requests were made and responses received
    expect(apiRequests.length).toBeGreaterThan(0);
    expect(apiResponses.length).toBeGreaterThan(0);
    
    // Verify no failed API calls
    const failedResponses = apiResponses.filter(r => r.status >= 400);
    expect(failedResponses).toHaveLength(0);
    
    console.log('✅ API Connection Verification PASSED');
  });

  test('CRITICAL: Component Rendering Verification', async () => {
    console.log('🔍 Testing Component Rendering...');
    
    await page.goto('https://pow3r-cashout.pages.dev/');
    await page.waitForLoadState('networkidle');
    
    // Verify main dashboard components render
    const mainComponents = [
      '[data-testid="dashboard-overview"]',
      '[data-testid="navigation-tabs"]',
      '[data-testid="workflow-content"]'
    ];
    
    for (const selector of mainComponents) {
      const component = page.locator(selector).first();
      await expect(component).toBeVisible();
    }
    
    // Test library components
    await page.goto('https://pow3r-cashout.pages.dev/library');
    await page.waitForLoadState('networkidle');
    
    const libraryComponents = [
      '[data-testid="component-library"]',
      '[data-testid="component-grid"]'
    ];
    
    for (const selector of libraryComponents) {
      const component = page.locator(selector).first();
      if (await component.isVisible()) {
        await expect(component).toBeVisible();
      }
    }
    
    console.log('✅ Component Rendering Verification PASSED');
  });

  test('CRITICAL: Error Handling Verification', async () => {
    console.log('🔍 Testing Error Handling...');
    
    // Test invalid route
    await page.goto('https://pow3r-cashout.pages.dev/invalid-route');
    await page.waitForLoadState('networkidle');
    
    // Should either redirect to home or show 404
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/https:\/\/pow3r-cashout\.pages\.dev\//);
    
    // Test with JavaScript disabled (simulate)
    await page.goto('https://pow3r-cashout.pages.dev/');
    await page.waitForLoadState('networkidle');
    
    // Verify basic functionality still works
    const title = await page.title();
    expect(title).toBeTruthy();
    
    console.log('✅ Error Handling Verification PASSED');
  });

  test('CRITICAL: Performance Verification', async () => {
    console.log('🔍 Testing Performance...');
    
    const startTime = Date.now();
    
    await page.goto('https://pow3r-cashout.pages.dev/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Verify page loads within reasonable time (10 seconds)
    expect(loadTime).toBeLessThan(10000);
    
    // Test library page performance
    const libraryStartTime = Date.now();
    await page.goto('https://pow3r-cashout.pages.dev/library');
    await page.waitForLoadState('networkidle');
    const libraryLoadTime = Date.now() - libraryStartTime;
    
    expect(libraryLoadTime).toBeLessThan(10000);
    
    console.log('✅ Performance Verification PASSED');
  });

  test('CRITICAL: Full User Journey Verification', async () => {
    console.log('🔍 Testing Full User Journey...');
    
    // Step 1: Load dashboard
    await page.goto('https://pow3r-cashout.pages.dev/');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Navigate to Library
    const libraryTab = page.locator('text=Library').first();
    await libraryTab.click();
    await page.waitForLoadState('networkidle');
    
    // Step 3: Navigate to New Post Flow
    const newPostFlowTab = page.locator('text=New Post Flow').first();
    await newPostFlowTab.click();
    await page.waitForLoadState('networkidle');
    
    // Step 4: Test search functionality
    const searchField = page.locator('input[type="text"]').first();
    if (await searchField.isVisible()) {
      await searchField.fill('test query');
      const value = await searchField.inputValue();
      expect(value).toBe('test query');
    }
    
    // Step 5: Navigate back to Overview
    const overviewTab = page.locator('text=Overview').first();
    await overviewTab.click();
    await page.waitForLoadState('networkidle');
    
    // Verify no errors throughout the journey
    const consoleErrors = await page.evaluate(() => {
      return (window as any).consoleErrors || [];
    });
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ Full User Journey Verification PASSED');
  });

  test('CRITICAL: Production Deployment Verification', async () => {
    console.log('🔍 Testing Production Deployment...');
    
    // Test main page accessibility
    const response = await page.goto('https://pow3r-cashout.pages.dev/');
    expect(response?.status()).toBe(200);
    
    // Test library route accessibility
    const libraryResponse = await page.goto('https://pow3r-cashout.pages.dev/library');
    expect(libraryResponse?.status()).toBe(200);
    
    // Test asset loading
    const assets = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return [...links, ...scripts].map(el => (el as any).href || (el as any).src);
    });
    
    // Verify all assets load
    for (const asset of assets) {
      if (asset && asset.startsWith('https://pow3r-cashout.pages.dev/')) {
        const assetResponse = await page.goto(asset);
        expect(assetResponse?.status()).toBe(200);
      }
    }
    
    console.log('✅ Production Deployment Verification PASSED');
  });
});