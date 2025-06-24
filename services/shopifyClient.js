// services/shopifyClient.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const shopify = axios.create({
  baseURL: `https://${process.env.SHOPIFY_STORE}/admin/api/${process.env.SHOPIFY_API_VERSION}`,
  headers: {
    'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    'Content-Type': 'application/json',
  },
});

export default shopify;
