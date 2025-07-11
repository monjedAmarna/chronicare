#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting Comprehensive Test Suite for Chronicare Backend\n');

// Test configuration
const testConfig = {
  unit: {
    pattern: 'tests/unit/**/*.test.js',
    description: 'Unit Tests'
  },
  integration: {
    pattern: 'tests/integration/**/*.test.js',
    description: 'Integration Tests'
  }
};

// Test results storage
const results = {
  unit: { passed: 0, failed: 0, total: 0 },
  integration: { passed: 0, failed: 0, total: 0 },
  coverage: null,
  summary: []
};

// Run tests for a specific type
function runTestSuite(type, config) {
  console.log(`\n📋 Running ${config.description}...`);
  console.log('='.repeat(50));
  
  try {
    const command = `npm test -- --testPathPattern="${config.pattern}" --verbose`;
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Parse test results
    const lines = output.split('\n');
    let passed = 0;
    let failed = 0;
    let total = 0;
    
    lines.forEach(line => {
      if (line.includes('✓')) passed++;
      if (line.includes('✗') || line.includes('FAIL')) failed++;
      if (line.includes('Test Suites:')) {
        const match = line.match(/(\d+) total/);
        if (match) total = parseInt(match[1]);
      }
    });
    
    results[type] = { passed, failed, total };
    console.log(`✅ ${config.description} completed: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      lines.filter(line => line.includes('✗') || line.includes('FAIL'))
        .forEach(line => console.log(`   ${line.trim()}`));
    }
    
  } catch (error) {
    console.log(`❌ ${config.description} failed to run:`, error.message);
    results[type] = { passed: 0, failed: 1, total: 1 };
  }
}

// Run coverage analysis
function runCoverage() {
  console.log('\n📊 Running Coverage Analysis...');
  console.log('='.repeat(50));
  
  try {
    const command = 'npm run test:coverage';
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Extract coverage percentage
    const coverageMatch = output.match(/All files\s+\|\s+(\d+\.\d+)%/);
    if (coverageMatch) {
      results.coverage = parseFloat(coverageMatch[1]);
      console.log(`📈 Coverage: ${results.coverage}%`);
    }
    
  } catch (error) {
    console.log('❌ Coverage analysis failed:', error.message);
  }
}

// Generate test report
function generateReport() {
  console.log('\n📝 Generating Test Report...');
  console.log('='.repeat(50));
  
  const totalPassed = results.unit.passed + results.integration.passed;
  const totalFailed = results.unit.failed + results.integration.failed;
  const totalTests = results.unit.total + results.integration.total;
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      totalPassed,
      totalFailed,
      successRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0
    },
    details: {
      unit: results.unit,
      integration: results.integration,
      coverage: results.coverage
    },
    recommendations: []
  };
  
  // Generate recommendations
  if (results.coverage && results.coverage < 80) {
    report.recommendations.push('Increase test coverage to at least 80%');
  }
  
  if (totalFailed > 0) {
    report.recommendations.push('Fix failing tests before deployment');
  }
  
  if (results.unit.total === 0) {
    report.recommendations.push('Add more unit tests for better code coverage');
  }
  
  if (results.integration.total === 0) {
    report.recommendations.push('Add integration tests for API endpoints');
  }
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Display summary
  console.log('\n🎯 Test Summary');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${totalPassed} ✅`);
  console.log(`Failed: ${totalFailed} ❌`);
  console.log(`Success Rate: ${report.summary.successRate}%`);
  console.log(`Coverage: ${results.coverage ? results.coverage + '%' : 'N/A'}`);
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`   • ${rec}`));
  }
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return report;
}

// Main execution
async function main() {
  try {
    // Run unit tests
    runTestSuite('unit', testConfig.unit);
    
    // Run integration tests
    runTestSuite('integration', testConfig.integration);
    
    // Run coverage analysis
    runCoverage();
    
    // Generate and display report
    const report = generateReport();
    
    // Exit with appropriate code
    const totalFailed = results.unit.failed + results.integration.failed;
    process.exit(totalFailed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Test suite execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 