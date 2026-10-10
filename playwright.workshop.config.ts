import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

// Preserved acceptance tests for the separate workshop checkpoint product.
export default defineConfig(config, {
  testIgnore: [],
  testMatch: "**/event-checklist.spec.ts",
});
