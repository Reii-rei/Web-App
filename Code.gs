/**
 * ABSENSI KARYAWAN — Backend Google Apps Script
 * ------------------------------------------------
 * Skrip ini menerima data dari index.html & admin.html, menyimpan foto ke
 * Google Drive, dan mencatat setiap absensi sebagai baris baru di Google Sheets.
 *
 * CARA PASANG:
 * 1. Buka https://sheets.google.com dan buat spreadsheet baru, beri nama "Absensi Karyawan".
 * 2. Di spreadsheet itu, klik Extensions → Apps Script.
 * 3. Hapus semua kode contoh, lalu tempel seluruh isi file ini.
 * 4. Klik ikon jam (Project Settings) → Script Properties → tambahkan
 *    property bernama ADMIN_PASSWORD dengan value kata sandi admin pilihanmu.
 * 5. Klik Deploy → New deployment → pilih tipe "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Salin URL Web App yang muncul, lalu tempelkan ke variabel API_URL
 *    di index.html dan admin.html.
 * 7. Setiap kali mengubah kode ini, buat "New deployment" lagi (bukan edit versi lama)
 *    agar perubahan berlaku pada URL yang sama, atau gunakan "Manage deployments" → Edit → New version.
 */

const SHEET_NAME = 'Absensi';
const FOLDER_NAME = 'Foto Absensi Karyawan';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  if (action === 'checkin') return respond(handleCheckin(data));
  if (action === 'login') return respond(handleLogin(data));
  if (action === 'list') return respond(handleList(data));
  if (action === 'update') return respond(handleUpdate(data));
  if (action === 'delete') return respond(handleDelete(data));

  return respond({ ok: false, error: 'Aksi tidak dikenal' });
}

function doGet(e) {
  return ContentService.createTextOutput('Absensi Karyawan API aktif.');
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Nama', 'ID', 'Jenis', 'Tanggal', 'Jam', 'FotoURL', 'Latitude', 'Longitude', 'Perangkat']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getFolder() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(FOLDER_NAME);
}

function checkAdmin(password) {
  const real = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  return real && password === real;
}

function handleCheckin(data) {
  const sheet = getSheet();
  const now = new Date();
  const tz = Session.getScriptTimeZone();

  let photoUrl = '';
  if (data.photo) {
    const base64 = data.photo.split(',')[1];
    const blob = Utilities.newBlob(Utilities.base64Decode(base64), 'image/jpeg',
      (data.name || 'karyawan').replace(/[^a-z0-9]/gi, '_') + '_' + now.getTime() + '.jpg');
    const file = getFolder().createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    photoUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
  }

  sheet.appendRow([
    now,
    data.name || '',
    data.empId || '',
    data.type || 'IN',
    Utilities.formatDate(now, tz, 'yyyy-MM-dd'),
    Utilities.formatDate(now, tz, 'HH:mm'),
    photoUrl,
    data.lat || '',
    data.lng || '',
    data.device || ''
  ]);

  return { ok: true };
}

function handleLogin(data) {
  return { ok: checkAdmin(data.password) };
}

function handleList(data) {
  if (!checkAdmin(data.password)) return { ok: false, error: 'Unauthorized' };
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    if (!r[1]) continue; // baris kosong
    rows.push({
      rowIndex: i + 1, // baris asli di spreadsheet (1-based, termasuk header)
      name: r[1], empId: r[2], type: r[3], date: r[4], time: r[5],
      photoUrl: r[6], lat: r[7], lng: r[8]
    });
  }
  return { ok: true, rows };
}

function handleUpdate(data) {
  if (!checkAdmin(data.password)) return { ok: false, error: 'Unauthorized' };
  const sheet = getSheet();
  const rowIndex = parseInt(data.rowIndex, 10);
  if (!rowIndex || rowIndex < 2) return { ok: false, error: 'Baris tidak valid' };
  sheet.getRange(rowIndex, 6).setValue(data.time); // kolom Jam
  return { ok: true };
}

function handleDelete(data) {
  if (!checkAdmin(data.password)) return { ok: false, error: 'Unauthorized' };
  const sheet = getSheet();
  const rowIndex = parseInt(data.rowIndex, 10);
  if (!rowIndex || rowIndex < 2) return { ok: false, error: 'Baris tidak valid' };
  sheet.deleteRow(rowIndex);
  return { ok: true };
}