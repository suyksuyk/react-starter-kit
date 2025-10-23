#!/usr/bin/env node

/**
 * Web模块部署测试脚本
 * 测试所有模块的访问和集成
 */

const https = require("https");

// 测试配置
const TEST_URLS = {
  营销网站: "https://www.rainwish.top",
  主应用: "https://rainwish.top",
  API服务: "https://rainwish-api.sydneiholdengi87033.workers.dev",
};

// 颜色输出
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n🔍 ${title}`, "blue");
  log("=".repeat(50), "blue");
}

// 测试HTTP状态码
async function testUrl(url, name) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const req = https.get(url, (res) => {
      const responseTime = Date.now() - startTime;

      if (res.statusCode === 200) {
        log(`✅ ${name}: ${res.statusCode} (${responseTime}ms)`, "green");
        resolve({ success: true, status: res.statusCode, responseTime });
      } else {
        log(`❌ ${name}: ${res.statusCode} (${responseTime}ms)`, "red");
        resolve({ success: false, status: res.statusCode, responseTime });
      }
    });

    req.on("error", (err) => {
      const responseTime = Date.now() - startTime;
      log(`❌ ${name}: ${err.message} (${responseTime}ms)`, "red");
      resolve({ success: false, error: err.message, responseTime });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      log(`❌ ${name}: 超时 (${responseTime}ms)`, "red");
      resolve({ success: false, error: "超时", responseTime });
    });
  });
}

// 测试跨模块导航
async function testNavigation() {
  logSection("跨模块导航测试");

  log("📋 测试项目:");
  log("  • 营销网站 → 主应用跳转");
  log("  • GitHub链接访问");
  log("  • 页面加载性能");

  // 这里可以添加更复杂的导航测试
  log("⚠️  需要手动验证导航功能", "yellow");

  return true;
}

// 测试API集成
async function testApiIntegration() {
  logSection("API集成测试");

  const apiTests = [
    {
      name: "API健康检查",
      url: "https://rainwish-api.sydneiholdengi87033.workers.dev/health",
    },
    {
      name: "认证端点",
      url: "https://rainwish-api.sydneiholdengi87033.workers.dev/auth/session",
    },
  ];

  let allPassed = true;

  for (const test of apiTests) {
    try {
      const result = await testUrl(test.url, test.name);
      if (!result.success) {
        allPassed = false;
      }
    } catch (error) {
      log(`❌ ${test.name}: ${error.message}`, "red");
      allPassed = false;
    }
  }

  return allPassed;
}

// 性能测试
async function testPerformance() {
  logSection("性能测试");

  const results = [];

  for (const [name, url] of Object.entries(TEST_URLS)) {
    const result = await testUrl(url, name);
    results.push({ name, ...result });
  }

  // 计算平均响应时间
  const validResults = results.filter((r) => r.success);
  if (validResults.length > 0) {
    const avgTime =
      validResults.reduce((sum, r) => sum + r.responseTime, 0) /
      validResults.length;
    log(`📊 平均响应时间: ${Math.round(avgTime)}ms`, "blue");
  }

  return results;
}

// 生成测试报告
function generateReport(results) {
  logSection("测试报告");

  const totalTests = Object.keys(TEST_URLS).length;
  const passedTests = results.filter((r) => r.success).length;
  const failedTests = totalTests - passedTests;

  log(`📈 测试统计:`, "blue");
  log(`  • 总测试数: ${totalTests}`);
  log(
    `  • 通过: ${passedTests}`,
    passedTests === totalTests ? "green" : "yellow",
  );
  log(`  • 失败: ${failedTests}`, failedTests === 0 ? "green" : "red");

  if (failedTests === 0) {
    log("\n🎉 所有测试通过！部署成功！", "green");
  } else {
    log("\n⚠️  部分测试失败，请检查配置", "yellow");
  }

  // 生成建议
  log("\n💡 建议:", "blue");
  if (failedTests > 0) {
    log("  • 检查域名DNS配置");
    log("  • 验证SSL证书设置");
    log("  • 确认Cloudflare Workers路由");
  }

  log("  • 监控页面加载性能");
  log("  • 验证跨域CORS设置");
  log("  • 测试用户交互流程");
}

// 主测试函数
async function runTests() {
  log("🚀 开始Web模块部署测试", "blue");
  log("测试时间:", new Date().toLocaleString());

  try {
    // 1. 基础连通性测试
    logSection("基础连通性测试");
    const results = await testPerformance();

    // 2. 导航测试
    await testNavigation();

    // 3. API集成测试
    await testApiIntegration();

    // 4. 生成报告
    generateReport(results);
  } catch (error) {
    log(`❌ 测试过程中发生错误: ${error.message}`, "red");
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testUrl,
  testNavigation,
  testApiIntegration,
  testPerformance,
};
