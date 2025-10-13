/**
 * Workflow API Test Runner
 * Comprehensive E2E testing following system policies
 * 
 * @version 1.0.0
 * @date 2024-12-20
 */

const { spawn } = require('child_process');
const path = require('path');

class WorkflowTestRunner {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0
    };
  }

  async runTests() {
    console.log('🧪 Starting Workflow API E2E Tests...');
    console.log('📋 Following system policies for comprehensive verification');
    
    try {
      // Run the workflow API tests
      await this.runPlaywrightTests();
      
      // Generate test report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      process.exit(1);
    }
  }

  async runPlaywrightTests() {
    return new Promise((resolve, reject) => {
      console.log('🎭 Running Playwright E2E tests...');
      
      const testProcess = spawn('npx', [
        'playwright', 
        'test', 
        'e2e/workflow-apis.spec.ts',
        '--reporter=json'
      ], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      testProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log(output.trim());
      });

      testProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.error(output.trim());
      });

      testProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Playwright tests completed successfully');
          this.parseTestResults(stdout);
          resolve();
        } else {
          console.error(`❌ Playwright tests failed with code ${code}`);
          this.parseTestResults(stdout);
          reject(new Error(`Tests failed with exit code ${code}`));
        }
      });

      testProcess.on('error', (error) => {
        console.error('❌ Failed to start Playwright tests:', error.message);
        reject(error);
      });
    });
  }

  parseTestResults(output) {
    try {
      // Try to parse JSON output from Playwright
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('{') && line.includes('"stats"')) {
          const result = JSON.parse(line);
          if (result.stats) {
            this.testResults = {
              passed: result.stats.passed || 0,
              failed: result.stats.failed || 0,
              skipped: result.stats.skipped || 0,
              total: result.stats.total || 0
            };
            return;
          }
        }
      }
      
      // Fallback: parse from console output
      const passedMatch = output.match(/(\d+) passed/);
      const failedMatch = output.match(/(\d+) failed/);
      const skippedMatch = output.match(/(\d+) skipped/);
      
      if (passedMatch) this.testResults.passed = parseInt(passedMatch[1]);
      if (failedMatch) this.testResults.failed = parseInt(failedMatch[1]);
      if (skippedMatch) this.testResults.skipped = parseInt(skippedMatch[1]);
      
      this.testResults.total = this.testResults.passed + this.testResults.failed + this.testResults.skipped;
      
    } catch (error) {
      console.warn('⚠️ Could not parse test results:', error.message);
    }
  }

  generateReport() {
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⏭️  Skipped: ${this.testResults.skipped}`);
    console.log(`📈 Total: ${this.testResults.total}`);
    
    if (this.testResults.total > 0) {
      const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
      console.log(`📊 Success Rate: ${successRate}%`);
    }
    
    console.log('='.repeat(50));
    
    // System policy compliance check
    if (this.testResults.failed === 0 && this.testResults.passed > 0) {
      console.log('🎉 All tests passed! System policies compliance verified.');
      console.log('✅ Workflow APIs are fully functional');
    } else if (this.testResults.skipped > 0) {
      console.log('⚠️  Some tests were skipped (likely due to services not running)');
      console.log('💡 Run "node scripts/start-test-services.js" to start required services');
    } else {
      console.log('❌ Some tests failed. System policies require full verification.');
      console.log('🔧 Please fix the failing tests before claiming success.');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const runner = new WorkflowTestRunner();
  runner.runTests().catch(console.error);
}

module.exports = WorkflowTestRunner;
