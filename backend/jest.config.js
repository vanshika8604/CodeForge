const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["dotenv/config"],
  testMatch: ["**/*.test.ts"],
  clearMocks: true,

  maxWorkers: 1,

  testTimeout: process.env.CI ? 20000 : 5000,
};