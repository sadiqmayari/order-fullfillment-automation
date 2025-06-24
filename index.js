import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

import shopify from './shopify.js'; // ⚠️ Make sure this exists!
import shopifyRoutes from './routes/shopify.js';
import leopardsRoutes from './routes/leopards.js';
import webhookRoutes from './routes/webhook.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// ✅ Shopify OAuth Routes
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

// Views + Routes
app.get('/', (req, res) => {
  res.render('admin');
});
app.use('/api/shopify', shopifyRoutes);
app.use('/api/leopards', leopardsRoutes);
app.use('/webhook', webhookRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
