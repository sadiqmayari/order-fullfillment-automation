// services/courierClient.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://merchantapistaging.leopardscourier.com/api';

export async function bookCN(payload) {
  const fullPayload = {
    api_key: process.env.LEOPARDS_API_KEY,
    api_password: process.env.LEOPARDS_API_PASSWORD,
    ...payload,
  };

  const response = await axios.post(`${BASE_URL}/bookPacket/format/json/`, fullPayload);
  return response.data;
}

export async function trackCN(cnNumber) {
  const payload = {
    api_key: process.env.LEOPARDS_API_KEY,
    api_password: process.env.LEOPARDS_API_PASSWORD,
    cn: cnNumber,
  };

  const response = await axios.post(`${BASE_URL}/trackPacket/format/json/`, payload);
  return response.data;
}
