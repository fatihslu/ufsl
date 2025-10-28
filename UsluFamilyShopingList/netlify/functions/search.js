// netlify/functions/search.js
const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const q = event.queryStringParameters.q || "mantı";
    const city = event.queryStringParameters.city || "34";

    const url = `https://api.marketfiyati.org.tr/api/v2/search?q=${encodeURIComponent(q)}&city=${city}`;

    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "https://marketfiyati.org.tr/",
        "Origin": "https://marketfiyati.org.tr",
      },
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `Marketfiyati API hatası: ${res.status}` }),
      };
    }

    const data = await res.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

