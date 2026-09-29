import { airtableRequest } from './airtable.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const records = [];
    let offset = '';

    do {
      const params = new URLSearchParams({ view: 'Grid view' });
      if (offset) params.set('offset', offset);
      const airtableResponse = await airtableRequest('Table 1', {}, `?${params.toString()}`);

      if (!airtableResponse.ok) {
        const detail = await airtableResponse.text();
        console.error('Airtable shop request failed', airtableResponse.status, detail);
        return response.status(502).json({ error: 'Unable to load shop data' });
      }

      const data = await airtableResponse.json();
      records.push(...data.records);
      offset = data.offset || '';
    } while (offset);

    response.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=300');
    return response.status(200).json({ records });
  } catch (error) {
    console.error('Shop API error', error);
    return response.status(500).json({ error: 'Unable to load shop data' });
  }
}

