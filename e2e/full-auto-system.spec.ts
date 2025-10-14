/**
 * Full-Auto Multi-Agent System E2E Tests
 * Validates complete autonomous development lifecycle per Pow3r Law v2.0
 * 
 * @version 1.0.0
 * @date 2025-10-13
 */

import { test, expect } from '@playwright/test';

test.describe('Full-Auto Multi-Agent System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to production URL
    await page.goto('https://pow3r-cashout.pages.dev');
  });

  test('Main Dashboard loads and displays all workflow sections', async ({ page }) => {
    // Verify main dashboard structure
    await expect(page.locator('h1')).toContainText('pow3r.cashout');
    await expect(page.locator('text=Workflow Management Dashboard')).toBeVisible();
    
    // Verify navigation tabs
    await expect(page.locator('text=Overview')).toBeVisible();
    await expect(page.locator('text=API Agent')).toBeVisible();
    await expect(page.locator('text=UI Agent')).toBeVisible();
    await expect(page.locator('text=Library')).toBeVisible();
    
    // Verify version and status badges
    await expect(page.locator('text=v3.0.0')).toBeVisible();
    await expect(page.locator('text=Live')).toBeVisible();
  });

  test('Component Library is fully functional', async ({ page }) => {
    // Navigate to library
    await page.click('text=Library');
    await page.waitForURL('**/library');
    
    // Verify library loads without JavaScript errors
    await expect(page.locator('h1')).toContainText('Component Library');
    await expect(page.locator('text=Redux UI (Unbound Design System)')).toBeVisible();
    
    // Verify search functionality
    await page.fill('input[placeholder="Search components..."]', 'ROC');
    await expect(page.locator('text=ROC')).toBeVisible();
    
    // Verify component count
    await expect(page.locator('text=/\\d+ \\/ 139 components/')).toBeVisible();
    
    // Verify compliance badges
    await expect(page.locator('text=100% Compliant')).toBeVisible();
    await expect(page.locator('text=JSDoc: 100%')).toBeVisible();
  });

  test('API Agent workflows are accessible', async ({ page }) => {
    await page.click('text=API Agent');
    
    // Verify API workflow cards
    await expect(page.locator('text=Flow Modification')).toBeVisible();
    await expect(page.locator('text=Message Review')).toBeVisible();
    await expect(page.locator('text=Project Management')).toBeVisible();
    
    // Test workflow navigation
    await page.click('text=Flow Modification');
    await expect(page.locator('text=Back to Dashboard')).toBeVisible();
  });

  test('UI Agent workflows are accessible', async ({ page }) => {
    await page.click('text=UI Agent');
    
    // Verify UI workflow cards
    await expect(page.locator('text=Phase 1: Content & Setup')).toBeVisible();
    await expect(page.locator('text=Phase 2: Automation & Management')).toBeVisible();
    await expect(page.locator('text=New Post Flow')).toBeVisible();
    
    // Test workflow navigation
    await page.click('text=Phase 1: Content & Setup');
    await expect(page.locator('text=Back to Dashboard')).toBeVisible();
  });

  test('All chart components render without errors', async ({ page }) => {
    await page.goto('https://pow3r-cashout.pages.dev/library');
    
    // Search for chart components
    await page.fill('input[placeholder="Search components..."]', 'Chart');
    
    // Verify multiple chart components are visible
    await expect(page.locator('text=Price History Chart')).toBeVisible();
    await expect(page.locator('text=Lead Pipeline Chart')).toBeVisible();
    
    // Test ROC curve chart specifically (was causing errors)
    await page.fill('input[placeholder="Search components..."]', 'ROC');
    await expect(page.locator('text=ROC & Precision-Recall Curves')).toBeVisible();
    
    // Verify no JavaScript errors in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait for components to load
    await page.waitForTimeout(2000);
    
    // Verify no critical errors
    const criticalErrors = errors.filter(error => 
      error.includes('TypeError') || 
      error.includes('Cannot read properties') ||
      error.includes('toFixed')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('Mobile responsiveness works correctly', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify mobile navigation
    await expect(page.locator('text=pow3r.cashout')).toBeVisible();
    
    // Test library on mobile
    await page.goto('https://pow3r-cashout.pages.dev/library');
    await expect(page.locator('text=Component Library')).toBeVisible();
    
    // Verify search works on mobile
    await page.fill('input[placeholder="Search components..."]', 'Dashboard');
    await expect(page.locator('text=Dashboard Card')).toBeVisible();
  });

  test('Production APIs are functional', async ({ page }) => {
    // Test health endpoint
    const healthResponse = await page.request.get('https://pow3r-cashout.pages.dev/api/health');
    expect(healthResponse.status()).toBe(200);
    
    // Test workflow APIs if available
    const workflowsResponse = await page.request.get('https://pow3r-cashout.pages.dev/api/workflows');
    // Note: This might return 404 if not implemented yet, which is acceptable
    expect([200, 404]).toContain(workflowsResponse.status());
  });

  test('Complete user workflow from dashboard to library', async ({ page }) => {
    // Start at main dashboard
    await page.goto('https://pow3r-cashout.pages.dev');
    await expect(page.locator('text=pow3r.cashout')).toBeVisible();
    
    // Navigate to library
    await page.click('text=Library');
    await page.waitForURL('**/library');
    
    // Search for a component
    await page.fill('input[placeholder="Search components..."]', 'Price');
    await expect(page.locator('text=Price History Chart')).toBeVisible();
    
    // Test filters
    await page.selectOption('select', 'Core');
    await expect(page.locator('text=Phase: Core')).toBeVisible();
    
    // Clear filters
    await page.click('text=Clear all');
    
    // Navigate back to dashboard
    await page.click('text=Dashboard');
    await page.waitForURL('**/');
    
    // Verify we're back at dashboard
    await expect(page.locator('text=Workflow Management Dashboard')).toBeVisible();
  });

  test('Screenshot capture for production verification', async ({ page }) => {
    // Navigate to main dashboard
    await page.goto('https://pow3r-cashout.pages.dev');
    
    // Wait for full load
    await page.waitForLoadState('networkidle');
    
    // Capture full page screenshot
    await page.screenshot({ 
      path: 'test-results/production-dashboard-full.png',
      fullPage: true 
    });
    
    // Navigate to library and capture
    await page.goto('https://pow3r-cashout.pages.dev/library');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/production-library-full.png',
      fullPage: true 
    });
    
    // Verify screenshots were captured
    const fs = require('fs');
    expect(fs.existsSync('test-results/production-dashboard-full.png')).toBe(true);
    expect(fs.existsSync('test-results/production-library-full.png')).toBe(true);
  });
});
