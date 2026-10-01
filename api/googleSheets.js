export const GOOGLE_APPS_SCRIPT_URL =
  process.env.GOOGLE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbz-npHBxMm1ey8iTPSX1zyzEXU-ntay_9KsbutHcZcrjGg9h10kIimFv7y8t78KYkN8/exec';

export const readGoogleSheetsJson = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Google Apps Script returned a non-JSON response');
  }

  return response.json();
};
