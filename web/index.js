// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// 🛠️ Auth start
app.get(shopify.config.auth.path, shopify.auth.begin());

// 🛠️ OAuth callback FIXED
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  async (_req, res) => {
    const { shop } = res.locals.shopify.session;
    res.redirect(`/?shop=${shop}`);
  }
);

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// 👮‍♂️ All /api/ routes must be authenticated
app.use("/api/*", shopify.validateAuthenticatedSession());
app.use(express.json());

// 🛠️ Example route (optional)
app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`{ productsCount { count } }`);
  res.status(200).send({ count: countData.data.productsCount.count });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

// ✅ FIX shop check
app.use("/*", async (req, res, next) => {
  const shop = req.query.shop;

  if (!shop) {
    return res.status(400).send("❌ Error: shop query missing in URL.");
  }

  return shopify.ensureInstalledOnShop()(req, res, next);
});

// Static index.html serve
app.use("/*", async (_req, res) => {
  res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);
