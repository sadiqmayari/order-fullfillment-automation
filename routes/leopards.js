// routes/leopards.js
import express from 'express';
import shopify from '../services/shopifyClient.js';
import { bookCN } from '../services/courierClient.js';

const router = express.Router();

// 📦 POST /api/leopards/book/:order_id
router.post('/book/:order_id', async (req, res) => {
  const orderId = req.params.order_id;

  try {
    const { data } = await shopify.get(`/orders/${orderId}.json`);
    const order = data.order;

    const payload = {
      booked_packet_weight: 2000,
      booked_packet_no_piece: 1,
      booked_packet_collect_amount: parseInt(order.total_price),
      booked_packet_order_id: order.order_number,
      origin_city: 'self',
      destination_city: 217,
      shipment_id: 1,
      shipment_name_eng: 'self',
      shipment_email: 'self',
      shipment_phone: 'self',
      shipment_address: 'self',
      consignment_name_eng: `${order.shipping_address?.first_name ?? ''} ${order.shipping_address?.last_name ?? ''}`,
      consignment_phone: order.shipping_address?.phone ?? '00000000000',
      consignment_address: `${order.shipping_address?.address1 ?? ''}, ${order.shipping_address?.city ?? ''}`,
      special_instructions: 'Auto-generated via API',
      shipment_type: '',
      custom_data: [
        { shopify_order_id: order.id },
      ],
      return_address: '',
      return_city: '',
      is_vpc: 0,
    };

    const response = await bookCN(payload);

    res.json({
      success: true,
      cn_booked: response,
    });
  } catch (error) {
    console.error('❌ Leopards Booking Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
