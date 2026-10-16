const SPREADSHEET_ID = '1nwrvC-85VpLv9PHpisLYuNsI5TMZHhzA7CJrBSOxD2I';
const SHOPS_SHEET_NAME = '店家資料';
const SUGGESTIONS_SHEET_NAME = '店家修改建議';
const TIME_ZONE = 'Asia/Taipei';

const SUGGESTION_TYPES = [
  '店家已停業',
  '營業時間有誤',
  '電話或地址有誤',
  '其他店家資料有誤',
  '新增店家',
  '其他建議',
];

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function cleanText(value, maxLength) {
  return String(value == null ? '' : value).trim().slice(0, maxLength);
}

function serializeValue(value) {
  if (value instanceof Date) return value.toISOString();
  return value;
}

function getSpreadsheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  if (spreadsheet.getSpreadsheetTimeZone() !== TIME_ZONE) {
    spreadsheet.setSpreadsheetTimeZone(TIME_ZONE);
  }
  return spreadsheet;
}

function findVillageForSuggestion(spreadsheet, shopId, shopName) {
  const shopSheet = spreadsheet.getSheetByName(SHOPS_SHEET_NAME);
  if (!shopSheet) return '';

  const values = shopSheet.getDataRange().getValues();
  if (values.length < 2) return '';

  const headers = values[0].map((header) => String(header).trim());
  const idIndex = headers.indexOf('id');
  const nameIndex = headers.findIndex((header) => ['Name', 'name', '店家名稱'].includes(header));
  const villageIndex = headers.findIndex((header) => ['village', 'Village', '村落名稱', '村落'].includes(header));
  if (villageIndex === -1) return '';

  const cleanShopId = cleanText(shopId, 80);
  const cleanShopName = cleanText(shopName, 160).toLocaleLowerCase();
  const rows = values.slice(1);
  const matchedRow = rows.find((row) => cleanShopId && idIndex >= 0 && String(row[idIndex]) === cleanShopId)
    || rows.find((row) => cleanShopName && nameIndex >= 0 && String(row[nameIndex]).trim().toLocaleLowerCase() === cleanShopName)
    || rows.find((row) => cleanShopName.length >= 2 && nameIndex >= 0 && String(row[nameIndex]).trim().toLocaleLowerCase().includes(cleanShopName));

  return matchedRow ? cleanText(matchedRow[villageIndex], 80) : '';
}

function doGet(event) {
  const action = event && event.parameter ? event.parameter.action : '';
  if (action !== 'shops') return jsonResponse({ ok: false, error: 'Unknown action' });

  try {
    const sheet = getSpreadsheet().getSheetByName(SHOPS_SHEET_NAME);
    if (!sheet) return jsonResponse({ ok: false, error: '店家資料工作表不存在' });

    const values = sheet.getDataRange().getValues();
    if (values.length < 2) return jsonResponse({ ok: true, records: [] });

    const headers = values[0].map((header) => String(header).trim());
    const idIndex = headers.indexOf('id');
    const nameIndex = headers.findIndex((header) => ['Name', 'name', '店家名稱'].includes(header));

    const records = values.slice(1)
      .filter((row) => row.some((value) => String(value).trim() !== ''))
      .filter((row) => nameIndex === -1 || String(row[nameIndex] || '').trim() !== '')
      .map((row, rowIndex) => {
        const fields = {};
        headers.forEach((header, columnIndex) => {
          if (header && header !== 'id') fields[header] = serializeValue(row[columnIndex]);
        });
        const id = idIndex >= 0 && row[idIndex]
          ? String(row[idIndex])
          : `shop-${String(rowIndex + 1).padStart(4, '0')}`;
        return { id, fields };
      });

    return jsonResponse({ ok: true, records, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: '無法讀取店家資料' });
  }
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse(event && event.postData ? event.postData.contents : '{}');
    if (body.website) return jsonResponse({ ok: true });

    const shopName = cleanText(body.shopName, 160);
    const details = cleanText(body.details, 2000);
    const suggestionType = cleanText(body.suggestionType, 80);
    const acceptsContact = body.acceptsContact === true;

    if (!shopName || !details || !SUGGESTION_TYPES.includes(suggestionType)) {
      return jsonResponse({ ok: false, error: '必填欄位不完整' });
    }

    lock.waitLock(10000);
    const spreadsheet = getSpreadsheet();
    const village = cleanText(body.village, 80) || findVillageForSuggestion(spreadsheet, body.shopId, shopName);
    const sheet = spreadsheet.getSheetByName(SUGGESTIONS_SHEET_NAME);
    if (!sheet) return jsonResponse({ ok: false, error: '店家修改建議工作表不存在' });

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
    const now = new Date();
    const reportId = `R-${Utilities.formatDate(now, TIME_ZONE, 'yyyyMMdd-HHmmss')}-${Math.floor(Math.random() * 900 + 100)}`;
    const record = {
      '回報編號': reportId,
      '店家名稱': shopName,
      '店家資料ID': cleanText(body.shopId, 80),
      '村落／地區': village,
      '建議類型': suggestionType,
      '建議內容': details,
      '照片佐證': '',
      '願意接受聯絡': acceptsContact,
      '聯絡方式': acceptsContact ? cleanText(body.contact, 240) : '',
      '處理狀態': '待確認',
      '提交時間': Utilities.formatDate(now, TIME_ZONE, 'yyyy/MM/dd HH:mm:ss'),
      '管理備註': '',
    };

    sheet.appendRow(headers.map((header) => record[header] == null ? '' : record[header]));
    return jsonResponse({ ok: true, id: reportId });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: '無法儲存建議' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}
