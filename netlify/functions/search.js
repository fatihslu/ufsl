// netlify/functions/search.js
const fetch = require('node-fetch'); // Netlify Node 18+ native fetch could be used, but keep node-fetch for clarity
const cheerio = require('cheerio'); // html parse

exports.handler = async (event) => {
  try {
    const query = (event.queryStringParameters && event.queryStringParameters.q) || '';
    if (!query) {
      return { statusCode: 400, body: JSON.stringify({ error: 'q param required' }) };
    }

    // encode query and fetch the search page from marketfiyati
    const url = `https://marketfiyati.org.tr/ara?q=${encodeURIComponent(query)}`;

    // Fetch HTML server-side (böylece CORS engeli yok)
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'netlify-function-market-scraper/1.0 (+https://yourdomain.example)' // nazik davranış
      },
    });
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ error: `Upstream returned ${res.status}` }) };
    }
    const html = await res.text();

    // Load into cheerio and parse product list (örnek bir parse mantığı; site yapısına göre uyarlayın)
    const $ = cheerio.load(html);

    const results = [];
    // Aşağıdaki selector'lar site HTML'ine göre değişir; örnek genel kalıbı gösterir.
    $('.product-card, .urun, .card').each((i, el) => {
      const title = $(el).find('.product-title, .title, h3').first().text().trim();
      const price = $(el).find('.price, .fiyat').first().text().trim();
      const image = $(el).find('img').first().attr('src') || null;
      const market = $(el).find('.market-name, .store').first().text().trim();

      if (title) {
        results.push({
          id: `p-${i}-${(title||'').replace(/\s+/g,'-').toLowerCase()}`,
          title,
          price,
          image,
          market
        });
      }
    });

    // Eğer site farklı yapıdaysa fallback: basit arama sonucu özetini al
    if (results.length === 0) {
      // örnek: sayfadaki ana içerikten kısa bir özet alalım
      const summary = $('body').text().replace(/\s+/g,' ').slice(0, 1000);
      return {
        statusCode: 200,
        body: JSON.stringify({ items: [], summary })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ items: results })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
