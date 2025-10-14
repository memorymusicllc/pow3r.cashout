#!/usr/bin/env node

import https from 'https';
import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔍 Testing ACTUAL Functionality - Full Auto Team');
console.log('===============================================\n');

// Test 1: Library Route Direct Access
console.log('1️⃣ Testing Library Route Direct Access...');
try {
  const response = await new Promise((resolve, reject) => {
    https.get('https://pow3r-cashout.pages.dev/library', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
  
  if (response.status === 200) {
    console.log('   ✅ Library route returns 200 OK');
    if (response.data.includes('Component Library')) {
      console.log('   ✅ Library page contains expected content');
    } else {
      console.log('   ❌ Library page missing expected content');
    }
  } else {
    console.log('   ❌ Library route failed with status:', response.status);
  }
} catch (error) {
  console.log('   ❌ Library route error:', error.message);
}

// Test 2: Main Dashboard
console.log('\n2️⃣ Testing Main Dashboard...');
try {
  const response = await new Promise((resolve, reject) => {
    https.get('https://pow3r-cashout.pages.dev', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
  
  if (response.status === 200) {
    console.log('   ✅ Main dashboard returns 200 OK');
    if (response.data.includes('pow3r.cashout')) {
      console.log('   ✅ Main dashboard contains expected content');
    } else {
      console.log('   ❌ Main dashboard missing expected content');
    }
  } else {
    console.log('   ❌ Main dashboard failed with status:', response.status);
  }
} catch (error) {
  console.log('   ❌ Main dashboard error:', error.message);
}

// Test 3: Check for JavaScript Errors
console.log('\n3️⃣ Testing for JavaScript Runtime Errors...');
try {
  // Use Playwright to actually test the functionality
  const testScript = `
    const { chromium } = require('playwright');
    (async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Test main dashboard
      console.log('Testing main dashboard...');
      await page.goto('https://pow3r-cashout.pages.dev');
      await page.waitForLoadState('networkidle');
      
      // Test library route
      console.log('Testing library route...');
      await page.goto('https://pow3r-cashout.pages.dev/library');
      await page.waitForLoadState('networkidle');
      
      // Test New Post Flow
      console.log('Testing New Post Flow...');
      await page.goto('https://pow3r-cashout.pages.dev');
      await page.waitForLoadState('networkidle');
      
      // Click on UI Agent tab
      await page.click('text=UI Agent');
      await page.waitForTimeout(1000);
      
      // Click on New Post Flow
      await page.click('text=New Post Flow');
      await page.waitForTimeout(1000);
      
      // Try to type in the search field
      const searchField = page.locator('input[placeholder*="Enter item name"]');
      if (await searchField.count() > 0) {
        await searchField.fill('iPhone 13');
        const value = await searchField.inputValue();
        console.log('Search field value:', value);
      } else {
        console.log('Search field not found');
      }
      
      await browser.close();
      
      // Output results
      console.log('JavaScript Errors Found:', errors.length);
      errors.forEach(error => console.log('  -', error));
      
      if (errors.length === 0) {
        console.log('✅ No JavaScript errors detected');
      } else {
        console.log('❌ JavaScript errors detected');
      }
    })();
  `;
  
  fs.writeFileSync('temp-test.js', testScript);
  execSync('node temp-test.js', { stdio: 'inherit' });
  fs.unlinkSync('temp-test.js');
  
} catch (error) {
  console.log('   ❌ JavaScript test error:', error.message);
}

console.log('\n🎯 Full Auto Team Analysis Complete');
console.log('===================================');
console.log('Next steps: Fix identified issues and redeploy');
