import { airtableRequest } from './airtable.js';

const ALLOWED_TYPES = new Set([
  '店家已停業',
  '營業時間有誤',
  '電話或地址有誤',
  '其他店家資料有誤',
  '新增店家',
  '其他建議',
]);

const cleanText = (value, maxLength) => String(value || '').trim().slice(0, maxLength);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : (request.body || {});

    // Hidden field used to discard basic automated spam without storing it.
    if (body.website) return response.status(200).json({ ok: true });

    const shopName = cleanText(body.shopName, 160);
    const details = cleanText(body.details, 2000);
    const suggestionType = cleanText(body.suggestionType, 80);
    const acceptsContact = body.acceptsContact === true;

    if (!shopName || !details || !ALLOWED_TYPES.has(suggestionType)) {
      return response.status(400).json({ error: 'Please complete the required fields' });
    }

    const fields = {
      '店家名稱': shopName,
      '店家資料ID': cleanText(body.shopId, 80),
      '村落／地區': cleanText(body.village, 80),
      '建議類型': suggestionType,
      '建議內容': details,
      '願意接受聯絡': acceptsContact,
      '聯絡方式': acceptsContact ? cleanText(body.contact, 240) : '',
      '處理狀態': '待確認',
    };

    const airtableResponse = await airtableRequest('店家修改建議', {
      method: 'POST',
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
    });

    if (!airtableResponse.ok) {
      const detail = await airtableResponse.text();
      console.error('Airtable suggestion request failed', airtableResponse.status, detail);
      return response.status(502).json({ error: 'Unable to save suggestion' });
    }

    const data = await airtableResponse.json();
    return response.status(201).json({ ok: true, id: data.records?.[0]?.id || null });
  } catch (error) {
    console.error('Suggestion API error', error);
    return response.status(500).json({ error: 'Unable to save suggestion' });
  }
}

