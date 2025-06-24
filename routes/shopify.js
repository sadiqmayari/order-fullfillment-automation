// routes/shopify.js
import express from 'express';
import shopify from '../services/shopifyClient.js';
import { bookCN } from '../services/courierClient.js';

const router = express.Router();

// 🔁 Auto-fulfill confirmed orders
router.get('/auto-fulfill', async (req, res) => {
  try {
    const { data } = await shopify.get(`/orders.json?fulfillment_status=unfulfilled&status=any`);
    const orders = data.orders;

    for (const order of orders) {
      const tags = order.tags.split(',').map(tag => tag.trim());
      if (tags.includes('✅ Confirmed')) {
        const fulfillmentOrderId = await getFulfillmentOrderId(order.id);

        // Optional: only if fulfillment_order_id is valid
        if (fulfillmentOrderId) {
          await shopify.post(`/fulfillments.json`, {
            fulfillment: {
              message: "Auto fulfilled via app",
              notify_customer: true,
              tracking_numbers: [],
              line_items: order.line_items.map(item => ({
                id: item.id,
                quantity: item.quantity,
              })),
              order_id: order.id,
            },
          });

          console.log(`✅ Order ${order.id} auto-fulfilled`);
        }
      }
    }

    res.send('Auto fulfillment complete.');
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Error auto-fulfilling orders');
  }
});

// 📦 Book order manually from form (admin.ejs)
router.post('/book', express.urlencoded({ extended: true }), async (req, res) => {
  const { order_id } = req.body;

  try {
    const { data } = await shopify.get(`/orders/${order_id}.json`);
    const order = data.order;

    const payload = {
      booked_packet_weight: 2000,
      booked_packet_no_piece: 1,
      booked_packet_collect_amount: parseInt(order.total_price),
      booked_packet_order_id: order.order_number,
      origin_city: 'self',
      destination_city: 217, // Update based on shipping
      shipment_id: 1,
      shipment_name_eng: 'self',
      shipment_email: 'self',
      shipment_phone: 'self',
      shipment_address: 'self',
      consignment_name_eng: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
      consignment_phone: order.shipping_address.phone || '00000000000',
      consignment_address: `${order.shipping_address.address1}, ${order.shipping_address.city}`,
      special_instructions: 'Handle with care',
      shipment_type: '',
      custom_data: [
        { shopify_order_id: order.id },
      ],
      return_address: '',
      return_city: '',
      is_vpc: 0,
    };

    const response = await bookCN(payload);
    console.log(`📦 Leopards booked:`, response);

    res.send('CN booked successfully.');
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Booking failed');
  }
});

// Helper: Get fulfillment order ID
async function getFulfillmentOrderId(orderId) {
  try {
    const { data } = await shopify.get(`/orders/${orderId}/fulfillment_orders.json`);
    return data.fulfillment_orders[0]?.id || null;
  } catch {
    return null;
  }
}

export default router;
