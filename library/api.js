// © 2025 arun•°Cumar. All Rights Reserved.

import config from '../settings/config';
import fetch from 'node-fetch';

const api = {
  get: async (endpoint, params = {}) => {
    const query = new URLSearchParams(params).toString()
    const res = await fetch(`${config.api.baseurl}${endpoint}?${query}`)
    return await res.json()
  },

  post: async (endpoint, body = {}) => {
    const res = await fetch(`${config.api.baseurl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    return await res.json()
  }
}

export default api;
