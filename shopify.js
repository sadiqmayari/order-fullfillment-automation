// shopify.js
import { shopifyApp } from "@shopify/shopify-app-express";
import { restResources } from "@shopify/shopify-api/rest/admin/2025-04";

const shopify = shopifyApp({
  api: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: ["write_orders", "read_orders", "write_fulfillments"],
    hostName: (process.env.HOST || "").replace(/^https?:\/\//, ""),
    isEmbeddedApp: false,
    apiVersion: "2025-04",
    restResources,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
});

export default shopify;
console.log('🔍 ENV CHECK:', {
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  hostName: process.env.HOST
});
