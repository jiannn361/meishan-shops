import { GOOGLE_APPS_SCRIPT_URL, readGoogleSheetsJson } from './googleSheets.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const url = new URL(GOOGLE_APPS_SCRIPT_URL);
    url.searchParams.set('action', 'shops');
    const googleResponse = await fetch(url, { redirect: 'follow' });
    const data = await readGoogleSheetsJson(googleResponse);

    if (!googleResponse.ok || !data.ok || !Array.isArray(data.records)) {
      console.error('Google Sheets shop request failed', googleResponse.status, data.error || 'Invalid response');
      return response.status(502).json({ error: 'Unable to load shop data' });
    }

    response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return response.status(200).json({ records: data.records });
  } catch (error) {
    console.error('Shop API error', error);
    return response.status(500).json({ error: 'Unable to load shop data' });
  }
}
