import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as XLSX from 'xlsx';

// Sanitize a title into a safe filename
export function safeFileName(title, fallback = 'Untitled') {
  const base = (title || fallback).trim() || fallback;
  return base.replace(/[\\/:*?"<>|]/g, '-');
}

// Convert headers + entries into an array-of-objects shape (for xlsx/json)
function toRowObjects(headers, entries) {
  return entries.map((entry) => {
    const row = {};
    headers.forEach((h) => {
      row[h.name] = entry.values[h.id] || '';
    });
    return row;
  });
}

async function shareFile(uri, mimeType, dialogTitle) {
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(uri, { mimeType, dialogTitle, UTI: undefined });
  }
  return uri;
}

export async function exportExcel(title, headers, entries) {
  if (headers.length === 0) throw new Error('Add at least one header before exporting.');
  const rows = toRowObjects(headers, entries);
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: headers.map((h) => h.name),
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
  const fileName = `${safeFileName(title)}.xlsx`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await shareFile(
    fileUri,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Export Excel File'
  );
  return fileUri;
}

export async function exportJSON(title, headers, entries) {
  if (headers.length === 0) throw new Error('Add at least one header before exporting.');
  const rows = toRowObjects(headers, entries);
  const payload = {
    title: title || 'Untitled',
    exportedAt: new Date().toISOString(),
    headers: headers.map((h) => h.name),
    records: rows,
  };
  const fileName = `${safeFileName(title)}.json`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  await shareFile(fileUri, 'application/json', 'Export JSON File');
  return fileUri;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function exportPDF(title, headers, entries) {
  if (headers.length === 0) throw new Error('Add at least one header before exporting.');

  const headerCells = headers.map((h) => `<th>${escapeHtml(h.name)}</th>`).join('');
  const bodyRows = entries
    .map((entry) => {
      const cells = headers
        .map((h) => `<td>${escapeHtml(entry.values[h.id] || '')}</td>`)
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #0F172A; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .meta { font-size: 11px; color: #64748B; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #E2E8F0; padding: 6px 10px; font-size: 11px; text-align: left; }
          th { background: #4F46E5; color: #fff; }
          tr:nth-child(even) { background: #F8FAFC; }
          .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #94A3B8; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title || 'Untitled')}</h1>
        <div class="meta">${entries.length} records &middot; exported ${new Date().toLocaleString()}</div>
        <table>
          <thead><tr>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
        <div class="footer">Made by Sahil Jadhav &middot; Built Different</div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const fileName = `${safeFileName(title)}.pdf`;
  const targetUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.copyAsync({ from: uri, to: targetUri });
  await shareFile(targetUri, 'application/pdf', 'Export PDF File');
  return targetUri;
}
