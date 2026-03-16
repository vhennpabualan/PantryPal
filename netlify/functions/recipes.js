const https = require('https');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON response')); }
      });
    }).on('error', reject);
  });
}

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON response')); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const { type, query, id, category } = event.queryStringParameters || {};
  const API_KEY = process.env.SPOONACULAR_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  try {
    let url = '';
    let data = null;

    if (type === 'search') {
      url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=12&addRecipeInformation=true&apiKey=${API_KEY}`;
      data = await httpsGet(url);

    } else if (type === 'category') {
      url = `https://api.spoonacular.com/recipes/complexSearch?type=${encodeURIComponent(category)}&number=12&addRecipeInformation=true&apiKey=${API_KEY}`;
      data = await httpsGet(url);

    } else if (type === 'detail') {
      url = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${API_KEY}`;
      data = await httpsGet(url);

    } else if (type === 'random') {
      url = `https://api.spoonacular.com/recipes/random?number=12&apiKey=${API_KEY}`;
      data = await httpsGet(url);

    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid type parameter' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};