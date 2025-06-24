// cron.js
import cron from 'node-cron';
import shopify from './services/shopifyClient.js';
import { trackCN } from './services/courierClient.js';
import dotenv from 'dotenv';
dotenv.config();

// 🔁 Daily: Update tags with courier status
cron.schedule('0 3 * * *', async () => {
  console.log('📅 Running daily courier tracking job...');
  try {
    const { data } = await shopify.get(`/orders.json?status=any&financial_status=paid`);
    const orders = data.orders;

    for (const order of orders) {
      const tags = order.tags.split(',').map(t => t.trim());

      const cnTag = tags.find(t => t.startsWith('CN-'));
      if (!cnTag) continue;

      const cn = cnTag.replace('CN-', '');
      const track = await trackCN(cn);

      const status = track.data[0]?.status;
      if (status && !tags.includes(status)) {
        const updatedTags = [...new Set([...tags, status])].join(', ');

        await shopify.put(`/orders/${order.id}.json`, {
          order: { id: order.id, tags: updatedTags },
        });

        console.log(`✅ Updated order ${order.id} with tag: ${status}`);
      }
    }
  } catch (err) {
    console.error('Tracking error:', err.message || err);
  }
});

// 💰 Every 15 days: Archive paid orders
cron.schedule('0 2 */15 * *', async () => {
  console.log('📅 Running 15-day payment check...');
  try {
    const { data } = await shopify.get(`/orders.json?status=open&financial_status=unpaid`);
    const unpaidOrders = data.orders;

    for (const order of unpaidOrders) {
      const orderId = order.id;

      // Placeholder: call API to verify payment via Leopards (if available)
      // For now we fake it as paid manually
      const isPaid = false; // Change this to dynamic check

      if (isPaid) {
        await shopify.put(`/orders/${orderId}.json`, {
          order: { id: orderId, financial_status: 'paid' },
        });

        await shopify.post(`/orders/${orderId}/close.json`);
        console.log(`💰 Archived paid order: ${orderId}`);
      }
    }
  } catch (err) {
    console.error('Payment check failed:', err.message || err);
  }
});
