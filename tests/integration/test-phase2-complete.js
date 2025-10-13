/**
 * Phase 2 Complete System Test
 * Comprehensive E2E test for all Phase 2 features
 * 
 * @version 2.0.0
 * @date 2025-01-08
 */

import puppeteer from 'puppeteer';

async function testPhase2Complete() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  try {
    console.log('🚀 Testing Phase 2 Complete System...\n');
    
    const page = await browser.newPage();
    
    // Test 1: Application loads with Phase 2 navigation
    console.log('📱 Test 1: Application loads with Phase 2 navigation');
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
      await page.waitForSelector('h1', { timeout: 10000 });
      
      // Check for all Phase 2 navigation tabs
      const navigationTabs = [
        'Overview', 'Listings', 'Leads', 'Automation', 
        'AI Responses', 'Negotiation', 'Analytics', 'Settings'
      ];
      
      for (const tab of navigationTabs) {
        const tabElement = await page.$(`xpath=//button[contains(text(), "${tab}")]`);
        if (tabElement) {
          console.log(`✅ Found navigation tab: ${tab}`);
        } else {
          throw new Error(`Navigation tab "${tab}" not found`);
        }
      }
      
      console.log('✅ All Phase 2 navigation tabs present');
      results.passed++;
      results.tests.push({ name: 'Phase 2 Navigation', status: 'PASS' });
    } catch (error) {
      console.log('❌ Phase 2 navigation test failed:', error.message);
      results.failed++;
      results.tests.push({ name: 'Phase 2 Navigation', status: 'FAIL', error: error.message });
    }

    // Test 2: Automation Engine
    console.log('\n🤖 Test 2: Automation Engine');
    try {
      await page.click('xpath=//button[contains(text(), "Automation")]');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const automationTitle = await page.$eval('h2', el => el.textContent);
      if (automationTitle.includes('Automation Engine')) {
        console.log('✅ Automation Engine loads successfully');
        
        // Check for key components
        const hasMetrics = await page.evaluate(() => {
          return document.body.textContent.includes('Total Posts') &&
                 document.body.textContent.includes('Success Rate') &&
                 document.body.textContent.includes('Content Rotation');
        });
        
        if (hasMetrics) {
          console.log('✅ Automation Engine metrics displayed');
          results.passed++;
          results.tests.push({ name: 'Automation Engine', status: 'PASS' });
        } else {
          throw new Error('Automation Engine metrics not found');
        }
      } else {
        throw new Error('Automation Engine title not found');
      }
    } catch (error) {
      console.log('❌ Automation Engine test failed:', error.message);
      results.failed++;
      results.tests.push({ name: 'Automation Engine', status: 'FAIL', error: error.message });
    }

    // Test 3: Lead Monitor
    console.log('\n👥 Test 3: Lead Monitor');
    try {
      await page.click('xpath=//button[contains(text(), "Leads")]');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const leadTitle = await page.$eval('h2', el => el.textContent);
      if (leadTitle.includes('Lead Monitor')) {
        console.log('✅ Lead Monitor loads successfully');
        
        // Check for key components
        const hasLeadMetrics = await page.evaluate(() => {
          return document.body.textContent.includes('Total Leads') &&
                 document.body.textContent.includes('Conversion Rate') &&
                 document.body.textContent.includes('Lead Score');
        });
        
        if (hasLeadMetrics) {
          console.log('✅ Lead Monitor metrics displayed');
          results.passed++;
          results.tests.push({ name: 'Lead Monitor', status: 'PASS' });
        } else {
          throw new Error('Lead Monitor metrics not found');
        }
      } else {
        throw new Error('Lead Monitor title not found');
      }
    } catch (error) {
      console.log('❌ Lead Monitor test failed:', error.message);
      results.failed++;
      results.tests.push({ name: 'Lead Monitor', status: 'FAIL', error: error.message });
    }

    // Test 4: AI Response System
    console.log('\n🧠 Test 4: AI Response System');
    try {
      await page.click('xpath=//button[contains(text(), "AI Responses")]');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiTitle = await page.$eval('h2', el => el.textContent);
      if (aiTitle.includes('AI Response System')) {
        console.log('✅ AI Response System loads successfully');
        
        // Check for key components
        const hasAIMetrics = await page.evaluate(() => {
          return document.body.textContent.includes('Total Responses') &&
                 document.body.textContent.includes('AI Confidence') &&
                 document.body.textContent.includes('Templates');
        });
        
        if (hasAIMetrics) {
          console.log('✅ AI Response System metrics displayed');
          results.passed++;
          results.tests.push({ name: 'AI Response System', status: 'PASS' });
        } else {
          throw new Error('AI Response System metrics not found');
        }
      } else {
        throw new Error('AI Response System title not found');
      }
    } catch (error) {
      console.log('❌ AI Response System test failed:', error.message);
      results.failed++;
      results.tests.push({ name: 'AI Response System', status: 'FAIL', error: error.message });
    }

    // Test 5: Negotiation Manager
    console.log('\n🤝 Test 5: Negotiation Manager');
    try {
      await page.click('xpath=//button[contains(text(), "Negotiation")]');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const negotiationTitle = await page.$eval('h2', el => el.textContent);
      if (negotiationTitle.includes('Negotiation Manager')) {
        console.log('✅ Negotiation Manager loads successfully');
        
        // Check for key components
        const hasNegotiationMetrics = await page.evaluate(() => {
          return document.body.textContent.includes('Total Negotiations') &&
                 document.body.textContent.includes('Success Rate') &&
                 document.body.textContent.includes('Meetup Conversion');
        });
        
        if (hasNegotiationMetrics) {
          console.log('✅ Negotiation Manager metrics displayed');
          results.passed++;
          results.tests.push({ name: 'Negotiation Manager', status: 'PASS' });
        } else {
          throw new Error('Negotiation Manager metrics not found');
        }
      } else {
        throw new Error('Negotiation Manager title not found');
      }
    } catch (error) {
      console.log('❌ Negotiation Manager test failed:', error.message);
      results.failed++;
      results.tests.push({ name: 'Negotiation Manager', status: 'FAIL', error: error.message });
    }

    // Test 6: Analytics Dashboard
    console.log('\n📊 Test 6: Analytics Dashboard');
    try {
      await page.click('xpath=//button[contains(text(), "Analytics")]');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analyticsTitle = await page.$eval('h2', el => el.textContent);
      if (analyticsTitle.includes('Analytics Dashboard')) {
        console.log('✅ Analytics Dashboard loads successfully');
        
        // Check for key components
        const hasAnalyticsMetrics = await page.evaluate(() => {
          return document.body.textContent.includes('Total Revenue') &&
                 document.body.textContent.includes('Conversion Rate') &&
                 document.body.textContent.includes('Active Listings');
        });
        
        if (hasAnalyticsMetrics) {
          console.log('✅ Analytics Dashboard metrics displayed');
          results.passed++;
          results.tests.push({ name: 'Analytics Dashboard', status: 'PASS' });
        } else {
          throw new Error('Analytics Dashboard metrics not found');
        }
      } else {
        throw new Error('Analytics Dashboard title not found');
      }
    } catch (error) {
      console.log('❌ Analytics Dashboard test failed:', error.message);
      results.failed++;
      results.tests.push({ name: 'Analytics Dashboard', status: 'FAIL', error: error.message });
    }

    // Test 7: Settings
    console.log('\n⚙️ Test 7: Settings');
    try {
      await page.click('xpath=//button[contains(text(), "Settings")]');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const settingsContent = await page.evaluate(() => {
        return document.body.textContent.includes('Settings') &&
               document.body.textContent.includes('System settings');
      });
      
      if (settingsContent) {
        console.log('✅ Settings page loads successfully');
        results.passed++;
        results.tests.push({ name: 'Settings', status: 'PASS' });
      } else {
        throw new Error('Settings content not found');
      }
    } catch (error) {
      console.log('❌ Settings test failed:', error.message);
      results.failed++;
      results.tests.push({ name: 'Settings', status: 'FAIL', error: error.message });
    }

    // Test 8: Navigation consistency
    console.log('\n🔄 Test 8: Navigation consistency');
    try {
      // Test navigation between components
      const components = [
        { name: 'Automation', expected: 'Automation Engine' },
        { name: 'Analytics', expected: 'Analytics Dashboard' },
        { name: 'Leads', expected: 'Lead Monitor' }
      ];
      
      for (const component of components) {
        await page.click(`xpath=//button[contains(text(), "${component.name}")]`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const title = await page.$eval('h2', el => el.textContent);
        if (title.includes(component.expected)) {
          console.log(`✅ ${component.name} navigation works`);
        } else {
          throw new Error(`${component.name} navigation failed`);
        }
      }
      
      console.log('✅ Navigation consistency verified');
      results.passed++;
      results.tests.push({ name: 'Navigation Consistency', status: 'PASS' });
    } catch (error) {
      console.log('❌ Navigation consistency test failed:', error.message);
      results.failed++;
      results.tests.push({ name: 'Navigation Consistency', status: 'FAIL', error: error.message });
    }

    // Test 9: Responsive design
    console.log('\n📱 Test 9: Responsive design');
    try {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mobileNavigation = await page.evaluate(() => {
        return document.body.textContent.includes('Overview') &&
               document.body.textContent.includes('Analytics');
      });
      
      if (mobileNavigation) {
        console.log('✅ Mobile responsive design works');
      } else {
        throw new Error('Mobile responsive design failed');
      }
      
      // Reset to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Responsive design verified');
      results.passed++;
      results.tests.push({ name: 'Responsive Design', status: 'PASS' });
    } catch (error) {
      console.log('❌ Responsive design test failed:', error.message);
      results.failed++;
      results.tests.push({ name: 'Responsive Design', status: 'FAIL', error: error.message });
    }

    // Test 10: Dark theme consistency
    console.log('\n🌙 Test 10: Dark theme consistency');
    try {
      const darkTheme = await page.evaluate(() => {
        return document.body.classList.contains('dark');
      });
      
      if (darkTheme) {
        console.log('✅ Dark theme is applied');
        results.passed++;
        results.tests.push({ name: 'Dark Theme', status: 'PASS' });
      } else {
        throw new Error('Dark theme not applied');
      }
    } catch (error) {
      console.log('❌ Dark theme test failed:', error.message);
      results.failed++;
      results.tests.push({ name: 'Dark Theme', status: 'FAIL', error: error.message });
    }

    // Take final screenshot
    console.log('\n📸 Taking final screenshot...');
    await page.screenshot({ 
      path: 'test-results/phase2-complete.png', 
      fullPage: true 
    });
    console.log('✅ Screenshot saved to test-results/phase2-complete.png');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    results.failed++;
  } finally {
    await browser.close();
  }

  // Generate test report
  console.log('\n📊 Phase 2 Complete System Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Detailed Results:');
  results.tests.forEach(test => {
    const status = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.status}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });

  if (results.failed === 0) {
    console.log('\n🎉 All Phase 2 features are working correctly!');
    console.log('🚀 Phase 2 implementation is 100% complete!');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the results above.');
  }

  return results;
}

testPhase2Complete().catch(console.error);
