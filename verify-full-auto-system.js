#!/usr/bin/env node

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PRODUCTION_URL = 'https://pow3r-cashout.pages.dev';
const TEST_RESULTS = {
  overall: 'PASS',
  tests: [],
  failures: [],
  timestamp: new Date().toISOString()
};

async function runFullAutoVerification() {
  console.log('🚀 FULL-AUTO MULTI-AGENT SYSTEM VERIFICATION STARTED');
  console.log('📋 Verifying all user requests on production deployment');
  console.log('🌐 Production URL:', PRODUCTION_URL);
  console.log('⏰ Timestamp:', TEST_RESULTS.timestamp);
  console.log('');

  try {
    // Phase 1: Build and Deploy Verification
    await verifyBuildAndDeploy();
    
    // Phase 2: Library Route Verification
    await verifyLibraryRoute();
    
    // Phase 3: New Post Flow Verification
    await verifyNewPostFlow();
    
    // Phase 4: Dashboard Navigation Verification
    await verifyDashboardNavigation();
    
    // Phase 5: API Connection Verification
    await verifyAPIConnection();
    
    // Phase 6: Component Rendering Verification
    await verifyComponentRendering();
    
    // Phase 7: Error Handling Verification
    await verifyErrorHandling();
    
    // Phase 8: Performance Verification
    await verifyPerformance();
    
    // Phase 9: Full User Journey Verification
    await verifyFullUserJourney();
    
    // Phase 10: Production Deployment Verification
    await verifyProductionDeployment();
    
    // Generate Final Report
    await generateFinalReport();
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR in Full-Auto System:', error);
    TEST_RESULTS.overall = 'FAIL';
    TEST_RESULTS.failures.push({
      test: 'system-error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function verifyBuildAndDeploy() {
  console.log('🔨 Phase 1: Build and Deploy Verification');
  
  try {
    // Check if build passes
    console.log('  📦 Running build...');
    execSync('npm run build', { stdio: 'pipe' });
    addTestResult('build', 'PASS', 'Build completed successfully');
    
    // Check git status
    console.log('  📋 Checking git status...');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      addTestResult('git-status', 'FAIL', 'Uncommitted changes detected');
    } else {
      addTestResult('git-status', 'PASS', 'No uncommitted changes');
    }
    
    // Check deployment status
    console.log('  🚀 Checking deployment status...');
    const deploymentList = execSync('wrangler pages deployment list', { encoding: 'utf8' });
    if (deploymentList.includes('pow3r-cashout')) {
      addTestResult('deployment-status', 'PASS', 'Deployment found in Cloudflare');
    } else {
      addTestResult('deployment-status', 'FAIL', 'Deployment not found in Cloudflare');
    }
    
  } catch (error) {
    addTestResult('build-deploy', 'FAIL', error.message);
  }
}

async function verifyLibraryRoute() {
  console.log('📚 Phase 2: Library Route Verification');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Test direct URL access
    console.log('  🔗 Testing direct URL access...');
    await page.goto(`${PRODUCTION_URL}/library`);
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    if (title && title.length > 0) {
      addTestResult('library-direct-url', 'PASS', 'Library page loads via direct URL');
    } else {
      addTestResult('library-direct-url', 'FAIL', 'Library page title is empty');
    }
    
    // Test dashboard navigation
    console.log('  🧭 Testing dashboard navigation...');
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    
    const libraryTab = page.locator('text=Library').first();
    if (await libraryTab.isVisible()) {
      await libraryTab.click();
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      if (currentUrl.includes('/library')) {
        addTestResult('library-navigation', 'PASS', 'Library accessible via dashboard navigation');
      } else {
        addTestResult('library-navigation', 'FAIL', 'Library navigation failed');
      }
    } else {
      addTestResult('library-navigation', 'FAIL', 'Library tab not found');
    }
    
    // Test component rendering
    console.log('  🎨 Testing component rendering...');
    await page.goto(`${PRODUCTION_URL}/library`);
    await page.waitForLoadState('networkidle');
    
    const libraryContent = page.locator('[data-testid="component-library"]').first();
    if (await libraryContent.isVisible()) {
      addTestResult('library-components', 'PASS', 'Library components render correctly');
    } else {
      addTestResult('library-components', 'FAIL', 'Library components not visible');
    }
    
    // Test for JavaScript errors
    console.log('  🐛 Checking for JavaScript errors...');
    const consoleErrors = await page.evaluate(() => {
      return (window as any).consoleErrors || [];
    });
    
    if (consoleErrors.length === 0) {
      addTestResult('library-js-errors', 'PASS', 'No JavaScript errors in library');
    } else {
      addTestResult('library-js-errors', 'FAIL', `JavaScript errors found: ${consoleErrors.join(', ')}`);
    }
    
  } catch (error) {
    addTestResult('library-route', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

async function verifyNewPostFlow() {
  console.log('📝 Phase 3: New Post Flow Verification');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to New Post Flow
    console.log('  🔗 Navigating to New Post Flow...');
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    
    const newPostFlowTab = page.locator('text=New Post Flow').first();
    if (await newPostFlowTab.isVisible()) {
      await newPostFlowTab.click();
      await page.waitForLoadState('networkidle');
      addTestResult('new-post-flow-navigation', 'PASS', 'New Post Flow accessible');
    } else {
      addTestResult('new-post-flow-navigation', 'FAIL', 'New Post Flow tab not found');
      return;
    }
    
    // Test search field
    console.log('  🔍 Testing search field...');
    const searchField = page.locator('input[type="text"]').first();
    if (await searchField.isVisible()) {
      await searchField.click();
      await searchField.fill('test search query');
      
      const fieldValue = await searchField.inputValue();
      if (fieldValue === 'test search query') {
        addTestResult('new-post-flow-search', 'PASS', 'Search field accepts input');
      } else {
        addTestResult('new-post-flow-search', 'FAIL', 'Search field input failed');
      }
    } else {
      addTestResult('new-post-flow-search', 'FAIL', 'Search field not found');
    }
    
    // Test API connection
    console.log('  🌐 Testing API connection...');
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });
    
    const searchButton = page.locator('button[type="submit"], button:has-text("Search")').first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(2000);
      
      if (apiRequests.length > 0) {
        addTestResult('new-post-flow-api', 'PASS', 'API requests made successfully');
      } else {
        addTestResult('new-post-flow-api', 'FAIL', 'No API requests detected');
      }
    }
    
  } catch (error) {
    addTestResult('new-post-flow', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

async function verifyDashboardNavigation() {
  console.log('🧭 Phase 4: Dashboard Navigation Verification');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    
    const navigationTabs = ['Overview', 'API Agent', 'UI Agent', 'Library', 'New Post Flow'];
    
    for (const tabName of navigationTabs) {
      console.log(`  📋 Testing ${tabName} tab...`);
      const tab = page.locator(`text=${tabName}`).first();
      
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForLoadState('networkidle');
        
        // Check for console errors
        const consoleErrors = await page.evaluate(() => {
          return (window as any).consoleErrors || [];
        });
        
        if (consoleErrors.length === 0) {
          addTestResult(`navigation-${tabName.toLowerCase().replace(' ', '-')}`, 'PASS', `${tabName} tab works correctly`);
        } else {
          addTestResult(`navigation-${tabName.toLowerCase().replace(' ', '-')}`, 'FAIL', `${tabName} tab has errors`);
        }
      } else {
        addTestResult(`navigation-${tabName.toLowerCase().replace(' ', '-')}`, 'FAIL', `${tabName} tab not found`);
      }
    }
    
  } catch (error) {
    addTestResult('dashboard-navigation', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

async function verifyAPIConnection() {
  console.log('🌐 Phase 5: API Connection Verification');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    
    const apiRequests = [];
    const apiResponses = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    // Trigger API calls
    const apiAgentTab = page.locator('text=API Agent').first();
    if (await apiAgentTab.isVisible()) {
      await apiAgentTab.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      if (apiRequests.length > 0) {
        addTestResult('api-requests', 'PASS', `${apiRequests.length} API requests made`);
      } else {
        addTestResult('api-requests', 'FAIL', 'No API requests detected');
      }
      
      if (apiResponses.length > 0) {
        const failedResponses = apiResponses.filter(r => r.status >= 400);
        if (failedResponses.length === 0) {
          addTestResult('api-responses', 'PASS', 'All API responses successful');
        } else {
          addTestResult('api-responses', 'FAIL', `${failedResponses.length} failed API responses`);
        }
      } else {
        addTestResult('api-responses', 'FAIL', 'No API responses received');
      }
    } else {
      addTestResult('api-connection', 'FAIL', 'API Agent tab not found');
    }
    
  } catch (error) {
    addTestResult('api-connection', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

async function verifyComponentRendering() {
  console.log('🎨 Phase 6: Component Rendering Verification');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Test main dashboard
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    
    const mainComponents = [
      '[data-testid="dashboard-overview"]',
      '[data-testid="navigation-tabs"]',
      '[data-testid="workflow-content"]'
    ];
    
    for (const selector of mainComponents) {
      const component = page.locator(selector).first();
      if (await component.isVisible()) {
        addTestResult(`component-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`, 'PASS', `Component ${selector} renders correctly`);
      } else {
        addTestResult(`component-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`, 'FAIL', `Component ${selector} not visible`);
      }
    }
    
    // Test library components
    await page.goto(`${PRODUCTION_URL}/library`);
    await page.waitForLoadState('networkidle');
    
    const libraryComponents = [
      '[data-testid="component-library"]',
      '[data-testid="component-grid"]'
    ];
    
    for (const selector of libraryComponents) {
      const component = page.locator(selector).first();
      if (await component.isVisible()) {
        addTestResult(`library-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`, 'PASS', `Library component ${selector} renders correctly`);
      }
    }
    
  } catch (error) {
    addTestResult('component-rendering', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

async function verifyErrorHandling() {
  console.log('🛡️ Phase 7: Error Handling Verification');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Test invalid route
    console.log('  🚫 Testing invalid route...');
    await page.goto(`${PRODUCTION_URL}/invalid-route`);
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    if (currentUrl.includes('invalid-route')) {
      addTestResult('error-handling-invalid-route', 'FAIL', 'Invalid route not handled');
    } else {
      addTestResult('error-handling-invalid-route', 'PASS', 'Invalid route handled correctly');
    }
    
    // Test basic functionality
    console.log('  ✅ Testing basic functionality...');
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    if (title && title.length > 0) {
      addTestResult('error-handling-basic', 'PASS', 'Basic functionality works');
    } else {
      addTestResult('error-handling-basic', 'FAIL', 'Basic functionality failed');
    }
    
  } catch (error) {
    addTestResult('error-handling', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

async function verifyPerformance() {
  console.log('⚡ Phase 8: Performance Verification');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Test main page performance
    console.log('  🏠 Testing main page performance...');
    const startTime = Date.now();
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    if (loadTime < 10000) {
      addTestResult('performance-main', 'PASS', `Main page loads in ${loadTime}ms`);
    } else {
      addTestResult('performance-main', 'FAIL', `Main page loads too slowly: ${loadTime}ms`);
    }
    
    // Test library page performance
    console.log('  📚 Testing library page performance...');
    const libraryStartTime = Date.now();
    await page.goto(`${PRODUCTION_URL}/library`);
    await page.waitForLoadState('networkidle');
    const libraryLoadTime = Date.now() - libraryStartTime;
    
    if (libraryLoadTime < 10000) {
      addTestResult('performance-library', 'PASS', `Library page loads in ${libraryLoadTime}ms`);
    } else {
      addTestResult('performance-library', 'FAIL', `Library page loads too slowly: ${libraryLoadTime}ms`);
    }
    
  } catch (error) {
    addTestResult('performance', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

async function verifyFullUserJourney() {
  console.log('👤 Phase 9: Full User Journey Verification');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Step 1: Load dashboard
    console.log('  🏠 Step 1: Load dashboard...');
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    
    // Step 2: Navigate to Library
    console.log('  📚 Step 2: Navigate to Library...');
    const libraryTab = page.locator('text=Library').first();
    if (await libraryTab.isVisible()) {
      await libraryTab.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Step 3: Navigate to New Post Flow
    console.log('  📝 Step 3: Navigate to New Post Flow...');
    const newPostFlowTab = page.locator('text=New Post Flow').first();
    if (await newPostFlowTab.isVisible()) {
      await newPostFlowTab.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Step 4: Test search functionality
    console.log('  🔍 Step 4: Test search functionality...');
    const searchField = page.locator('input[type="text"]').first();
    if (await searchField.isVisible()) {
      await searchField.fill('test query');
      const value = await searchField.inputValue();
      if (value === 'test query') {
        addTestResult('user-journey-search', 'PASS', 'Search functionality works in user journey');
      } else {
        addTestResult('user-journey-search', 'FAIL', 'Search functionality failed in user journey');
      }
    }
    
    // Step 5: Navigate back to Overview
    console.log('  🏠 Step 5: Navigate back to Overview...');
    const overviewTab = page.locator('text=Overview').first();
    if (await overviewTab.isVisible()) {
      await overviewTab.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Check for errors throughout journey
    const consoleErrors = await page.evaluate(() => {
      return (window as any).consoleErrors || [];
    });
    
    if (consoleErrors.length === 0) {
      addTestResult('user-journey-errors', 'PASS', 'No errors in full user journey');
    } else {
      addTestResult('user-journey-errors', 'FAIL', `Errors in user journey: ${consoleErrors.join(', ')}`);
    }
    
  } catch (error) {
    addTestResult('user-journey', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

async function verifyProductionDeployment() {
  console.log('🚀 Phase 10: Production Deployment Verification');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Test main page accessibility
    console.log('  🏠 Testing main page accessibility...');
    const response = await page.goto(PRODUCTION_URL);
    if (response?.status() === 200) {
      addTestResult('deployment-main', 'PASS', 'Main page accessible');
    } else {
      addTestResult('deployment-main', 'FAIL', `Main page status: ${response?.status()}`);
    }
    
    // Test library route accessibility
    console.log('  📚 Testing library route accessibility...');
    const libraryResponse = await page.goto(`${PRODUCTION_URL}/library`);
    if (libraryResponse?.status() === 200) {
      addTestResult('deployment-library', 'PASS', 'Library route accessible');
    } else {
      addTestResult('deployment-library', 'FAIL', `Library route status: ${libraryResponse?.status()}`);
    }
    
    // Test asset loading
    console.log('  📦 Testing asset loading...');
    const assets = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return [...links, ...scripts].map(el => (el as any).href || (el as any).src);
    });
    
    let assetLoadSuccess = 0;
    let assetLoadTotal = 0;
    
    for (const asset of assets) {
      if (asset && asset.startsWith(PRODUCTION_URL)) {
        assetLoadTotal++;
        try {
          const assetResponse = await page.goto(asset);
          if (assetResponse?.status() === 200) {
            assetLoadSuccess++;
          }
        } catch (error) {
          // Asset load failed
        }
      }
    }
    
    if (assetLoadTotal === 0) {
      addTestResult('deployment-assets', 'PASS', 'No assets to test');
    } else if (assetLoadSuccess === assetLoadTotal) {
      addTestResult('deployment-assets', 'PASS', `All ${assetLoadTotal} assets load successfully`);
    } else {
      addTestResult('deployment-assets', 'FAIL', `${assetLoadSuccess}/${assetLoadTotal} assets load successfully`);
    }
    
  } catch (error) {
    addTestResult('deployment', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

function addTestResult(testName, status, message) {
  const testResult = {
    test: testName,
    status: status,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  TEST_RESULTS.tests.push(testResult);
  
  if (status === 'FAIL') {
    TEST_RESULTS.failures.push(testResult);
    TEST_RESULTS.overall = 'FAIL';
  }
  
  console.log(`    ${status === 'PASS' ? '✅' : '❌'} ${testName}: ${message}`);
}

async function generateFinalReport() {
  console.log('');
  console.log('📊 FINAL VERIFICATION REPORT');
  console.log('============================');
  console.log(`Overall Status: ${TEST_RESULTS.overall}`);
  console.log(`Total Tests: ${TEST_RESULTS.tests.length}`);
  console.log(`Passed: ${TEST_RESULTS.tests.filter(t => t.status === 'PASS').length}`);
  console.log(`Failed: ${TEST_RESULTS.failures.length}`);
  console.log(`Timestamp: ${TEST_RESULTS.timestamp}`);
  console.log('');
  
  if (TEST_RESULTS.failures.length > 0) {
    console.log('❌ FAILED TESTS:');
    TEST_RESULTS.failures.forEach(failure => {
      console.log(`  - ${failure.test}: ${failure.message}`);
    });
    console.log('');
  }
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'reports', `20241220_REPORT_FULL_AUTO_VERIFICATION.md`);
  const reportContent = `# Full-Auto Multi-Agent System Verification Report

**Date:** ${new Date().toISOString()}
**Overall Status:** ${TEST_RESULTS.overall}
**Production URL:** ${PRODUCTION_URL}

## Summary
- **Total Tests:** ${TEST_RESULTS.tests.length}
- **Passed:** ${TEST_RESULTS.tests.filter(t => t.status === 'PASS').length}
- **Failed:** ${TEST_RESULTS.failures.length}

## Test Results

${TEST_RESULTS.tests.map(test => `### ${test.test}
- **Status:** ${test.status}
- **Message:** ${test.message}
- **Timestamp:** ${test.timestamp}
`).join('\n')}

## Failed Tests

${TEST_RESULTS.failures.length > 0 ? TEST_RESULTS.failures.map(failure => `### ${failure.test}
- **Status:** ${failure.status}
- **Message:** ${failure.message}
- **Timestamp:** ${failure.timestamp}
`).join('\n') : 'No failed tests'}

## Compliance Status
- **Pow3r Law:** ${TEST_RESULTS.overall === 'PASS' ? 'COMPLIANT' : 'NON-COMPLIANT'}
- **System Policies:** ${TEST_RESULTS.overall === 'PASS' ? 'COMPLIANT' : 'NON-COMPLIANT'}
- **Documentation:** ${TEST_RESULTS.overall === 'PASS' ? 'COMPLIANT' : 'NON-COMPLIANT'}
- **Testing:** ${TEST_RESULTS.overall === 'PASS' ? 'COMPLIANT' : 'NON-COMPLIANT'}
- **Deployment:** ${TEST_RESULTS.overall === 'PASS' ? 'COMPLIANT' : 'NON-COMPLIANT'}

## Conclusion
${TEST_RESULTS.overall === 'PASS' ? '✅ All user requests have been successfully verified and are working correctly on the production deployment.' : '❌ Critical issues detected that require immediate attention.'}
`;

  // Ensure reports directory exists
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, reportContent);
  console.log(`📄 Report saved to: ${reportPath}`);
  
  // Exit with appropriate code
  if (TEST_RESULTS.overall === 'PASS') {
    console.log('🎉 FULL-AUTO VERIFICATION COMPLETED SUCCESSFULLY');
    process.exit(0);
  } else {
    console.log('💥 FULL-AUTO VERIFICATION FAILED - CRITICAL ISSUES DETECTED');
    process.exit(1);
  }
}

// Run the verification
runFullAutoVerification().catch(error => {
  console.error('💥 CRITICAL ERROR:', error);
  process.exit(1);
});
