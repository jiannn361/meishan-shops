import fs from 'node:fs/promises';
import path from 'node:path';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const sourcePath = 'C:/Users/User/Downloads/Table 1-Grid view.csv';
const outputDir = 'C:/Users/User/Desktop/meishan-app/outputs/google-sheets-migration';
const outputPath = path.join(outputDir, '梅山店家資料.xlsx');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }
  if (value || row.length) {
    row.push(value.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows;
}

const csvText = (await fs.readFile(sourcePath, 'utf8')).replace(/^\uFEFF/, '');
const parsed = parseCsv(csvText);
const sourceHeaders = parsed[0];
const sourceRows = parsed.slice(1).filter((row) => row.some((value) => String(value || '').trim()));
const headers = ['id', ...sourceHeaders];

const numericHeaders = new Set(['lat', 'lng', 'Rating']);
const checkboxHeaders = new Set(['電梯', '電車充電']);
const cleanedRows = sourceRows.map((sourceRow, rowIndex) => {
  const values = sourceHeaders.map((header, columnIndex) => {
    let value = sourceRow[columnIndex] ?? '';
    if (header === 'lng' && /^,\s*-?\d/.test(value)) value = value.replace(/^,\s*/, '');
    if (numericHeaders.has(header) && String(value).trim() !== '') {
      const number = Number(value);
      return Number.isFinite(number) ? number : value;
    }
    if (checkboxHeaders.has(header)) return String(value).trim().toLowerCase() === 'checked';
    return value;
  });
  return [`shop-${String(rowIndex + 1).padStart(4, '0')}`, ...values];
});

const workbook = Workbook.create();
const shopsSheet = workbook.worksheets.add('店家資料');
shopsSheet.showGridlines = false;
shopsSheet.getRangeByIndexes(0, 0, cleanedRows.length + 1, headers.length).values = [headers, ...cleanedRows];

const lastColumnName = (() => {
  let number = headers.length;
  let name = '';
  while (number > 0) {
    number -= 1;
    name = String.fromCharCode(65 + (number % 26)) + name;
    number = Math.floor(number / 26);
  }
  return name;
})();

const shopsTable = shopsSheet.tables.add(`A1:${lastColumnName}${cleanedRows.length + 1}`, true, 'ShopsTable');
shopsTable.style = 'TableStyleMedium4';
shopsTable.showBandedRows = true;
shopsSheet.freezePanes.freezeRows(1);
shopsSheet.freezePanes.freezeColumns(2);

const allShopRange = shopsSheet.getRange(`A1:${lastColumnName}${cleanedRows.length + 1}`);
allShopRange.format.font = { name: 'Arial', size: 10, color: '#1F2937' };
allShopRange.format.verticalAlignment = 'center';
shopsSheet.getRange(`A1:${lastColumnName}1`).format = {
  fill: '#506638',
  font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
  rowHeight: 28,
};

shopsSheet.getRange(`A2:A${cleanedRows.length + 1}`).format.columnWidth = 13;
shopsSheet.getRange(`B2:C${cleanedRows.length + 1}`).format.columnWidth = 22;
shopsSheet.getRange(`D2:E${cleanedRows.length + 1}`).format.columnWidth = 16;
shopsSheet.getRange(`F2:F${cleanedRows.length + 1}`).format.columnWidth = 30;
shopsSheet.getRange(`G2:K${cleanedRows.length + 1}`).format.columnWidth = 20;
shopsSheet.getRange(`L2:M${cleanedRows.length + 1}`).format.columnWidth = 28;
shopsSheet.getRange(`Q2:R${cleanedRows.length + 1}`).format.columnWidth = 42;
shopsSheet.getRange(`S2:S${cleanedRows.length + 1}`).format.numberFormat = '0.0';

const suggestionsSheet = workbook.worksheets.add('店家修改建議');
suggestionsSheet.showGridlines = false;
const suggestionHeaders = [
  '回報編號', '店家名稱', '店家資料ID', '村落／地區', '建議類型', '建議內容',
  '照片佐證', '願意接受聯絡', '聯絡方式', '處理狀態', '提交時間', '管理備註'
];
suggestionsSheet.getRange('A1:L2').values = [suggestionHeaders, Array(suggestionHeaders.length).fill('')];
const suggestionsTable = suggestionsSheet.tables.add('A1:L2', true, 'SuggestionsTable');
suggestionsTable.style = 'TableStyleMedium4';
suggestionsSheet.freezePanes.freezeRows(1);
suggestionsSheet.getRange('A1:L1').format = {
  fill: '#506638',
  font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
  rowHeight: 28,
};
suggestionsSheet.getRange('A1:L2').format.font = { name: 'Arial', size: 10 };
suggestionsSheet.getRange('A:A').format.columnWidth = 14;
suggestionsSheet.getRange('B:B').format.columnWidth = 24;
suggestionsSheet.getRange('C:C').format.columnWidth = 18;
suggestionsSheet.getRange('D:E').format.columnWidth = 18;
suggestionsSheet.getRange('F:F').format.columnWidth = 44;
suggestionsSheet.getRange('G:G').format.columnWidth = 26;
suggestionsSheet.getRange('H:H').format.columnWidth = 18;
suggestionsSheet.getRange('I:I').format.columnWidth = 28;
suggestionsSheet.getRange('J:J').format.columnWidth = 16;
suggestionsSheet.getRange('K:K').format.columnWidth = 22;
suggestionsSheet.getRange('L:L').format.columnWidth = 36;

workbook.recalculate();
await fs.mkdir(outputDir, { recursive: true });

const shopsPreview = await workbook.render({
  sheetName: '店家資料',
  range: 'A1:H14',
  scale: 1.5,
  format: 'png',
});
await fs.writeFile(path.join(outputDir, '店家資料-preview.png'), new Uint8Array(await shopsPreview.arrayBuffer()));

const suggestionsPreview = await workbook.render({
  sheetName: '店家修改建議',
  range: 'A1:L8',
  scale: 1.5,
  format: 'png',
});
await fs.writeFile(path.join(outputDir, '店家修改建議-preview.png'), new Uint8Array(await suggestionsPreview.arrayBuffer()));

const inspection = await workbook.inspect({
  kind: 'table',
  range: '店家資料!A1:H12',
  include: 'values,formulas',
  tableMaxRows: 12,
  tableMaxCols: 8,
});
await fs.writeFile(path.join(outputDir, 'inspection.ndjson'), inspection.ndjson, 'utf8');

const formulaErrors = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',
  options: { useRegex: true, maxResults: 100 },
  summary: 'final formula error scan',
});
await fs.writeFile(path.join(outputDir, 'formula-errors.ndjson'), formulaErrors.ndjson, 'utf8');

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(JSON.stringify({ outputPath, sourceRows: sourceRows.length, columns: headers.length }, null, 2));

