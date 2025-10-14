#!/usr/bin/env node

import { chromium } from 'playwright';

(async () => {
  console.log('🔍 Direct Testing of Critical Issues');
  console.log('====================================\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  try {
    // Test 1: Main Dashboard
    console.log('1️⃣ Testing Main Dashboard...');
    await page.goto('https://pow3r-cashout.pages.dev');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    console.log('   Title:', title);
    
    // Test 2: Library Route
    console.log('\n2️⃣ Testing Library Route...');
    await page.goto('https://pow3r-cashout.pages.dev/library');
    await page.waitForLoadState('networkidle');
    
    const libraryTitle = await page.title();
    console.log('   Library Title:', libraryTitle);
    
    // Check if Component Library content is present
    const libraryContent = await page.textContent('body');
    if (libraryContent.includes('Component Library')) {
      console.log('   ✅ Component Library content found');
    } else {
      console.log('   ❌ Component Library content NOT found');
      console.log('   Content preview:', libraryContent.substring(0, 200));
    }
    
    // Test 3: New Post Flow
    console.log('\n3️⃣ Testing New Post Flow...');
    await page.goto('https://pow3r-cashout.pages.dev');
    await page.waitForLoadState('networkidle');
    
    // Click UI Agent tab
    await page.click('text=UI Agent');
    await page.waitForTimeout(1000);
    
    // Click New Post Flow
    await page.click('text=New Post Flow');
    await page.waitForTimeout(2000);
    
    // Try to find and interact with search field
    const searchField = page.locator('input[placeholder*="Enter item name"]');
    const fieldCount = await searchField.count();
    console.log('   Search field count:', fieldCount);
    
    if (fieldCount > 0) {
      await searchField.fill('iPhone 13');
      const value = await searchField.inputValue();
      console.log('   ✅ Search field value:', value);
    } else {
      console.log('   ❌ Search field not found');
    }
    
    // Wait a bit to see any errors
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.log('❌ Test Error:', error.message);
  }
  
  console.log('\n📊 Summary:');
  console.log('JavaScript Errors:', errors.length);
  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach(error => console.log('  -', error));
  }
  
  await browser.close();
})();
