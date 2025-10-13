#!/usr/bin/env node

/**
 * Test script to verify deployments are working correctly
 * Tests both DEV and PROD environments
 */

import https from 'https';
import http from 'http';

// Test URLs
const DEV_URL = 'https://2e00e047.cashruleseverythingaroundme.pages.dev';
const PROD_URL = 'https://4c67aaf3.cashruleseverythingaroundme.pages.dev';
const COMPONENT_LIBRARY_URL = 'https://component-library.cashruleseverythingaroundme.pages.dev';

// Test function
function testUrl(url, name) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${name}: ${url} - Status: ${res.statusCode}`);
          
          // Check for key content
          if (data.includes('pow3r') || data.includes('dashboard') || data.includes('component')) {
            console.log(`   📄 Content verified: Contains expected content`);
          }
          
          resolve({ url, status: res.statusCode, content: data.length > 0 });
        } else {
          console.log(`❌ ${name}: ${url} - Status: ${res.statusCode}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name}: ${url} - Error: ${err.message}`);
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ ${name}: ${url} - Timeout`);
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Main test function
async function runTests() {
  console.log('🚀 Testing Deployments...\n');
  
  const tests = [
    { url: DEV_URL, name: 'DEV Environment' },
    { url: PROD_URL, name: 'PROD Environment' },
    { url: COMPONENT_LIBRARY_URL, name: 'Component Library' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      await testUrl(test.url, test.name);
      passed++;
    } catch (error) {
      failed++;
    }
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All deployments are working correctly!');
    console.log('\n🔗 Live URLs:');
    console.log(`   DEV: ${DEV_URL}`);
    console.log(`   PROD: ${PROD_URL}`);
    console.log(`   Component Library: ${COMPONENT_LIBRARY_URL}`);
  } else {
    console.log('\n⚠️  Some deployments failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
