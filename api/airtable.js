const AIRTABLE_BASE_ID = 'appkU3kxP74Gq7iXj';

export const getAirtableToken = () => process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_API_KEY || '';

export const airtableRequest = async (tableName, options = {}, query = '') => {
  const token = getAirtableToken();
  if (!token) throw new Error('Airtable API token is not configured');

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}${query}`;
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

