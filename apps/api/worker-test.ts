/**
 * 简化版Worker用于测试基本连接
 */

import { Hono } from "hono";

const worker = new Hono();

// 基本健康检查端点
worker.get("/health", (c) => {
  return c.json({
    status: "ok",
    message: "Worker is running",
    timestamp: new Date().toISOString(),
  });
});

// 基本API信息端点
worker.get("/api", (c) => {
  return c.json({
    name: "Rainwish API",
    version: "1.0.0",
    environment: "production",
    status: "running",
  });
});

// 根路径
worker.get("/", (c) => {
  return c.json({
    message: "Rainwish API is running",
    endpoints: ["/health", "/api"],
  });
});

export default worker;
