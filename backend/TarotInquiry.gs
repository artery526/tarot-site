const TAROT_INQUIRY_CONFIG = Object.freeze({
  spreadsheetId: "1H7rhWYzcl7-VsHpaGTIyaF7LeVlZpOP6ed3Eeub8AOg",
  ordersSheet: "客戶單",
  inquiriesSheet: "塔羅小屋",
  orderHeaders: {
    number: "訂單編號",
    email: "電子郵件信箱",
    status: "訂單是否已處理",
    total: "網頁送出總金額",
  },
  inquiryHeaders: ["訂單編號", "Email", "稱呼", "問題內容", "單張或三張", "處理狀態"],
  processedValue: "已結單",
});

function doPost(event) {
  try {
    const input = JSON.parse(event.postData.contents || "{}");
    if (!hasValidSecret_(input.secret)) return output_({ ok: false, code: "SERVICE_UNAVAILABLE" }, 403);

    const payload = input.payload || {};
    if (!allowRequest_(input.clientIp || "unknown")) return output_({ ok: false, code: "RATE_LIMITED" }, 429);

    if (input.action === "verify") return verifyOrder_(payload);
    if (input.action === "submit") return submitInquiry_(payload);
    return output_({ ok: false, code: "INVALID_INPUT" }, 400);
  } catch (error) {
    return output_({ ok: false, code: "SERVICE_UNAVAILABLE" }, 500);
  }
}

function verifyOrder_(payload) {
  const orderNumber = cleanText_(payload.orderNumber, 80);
  const type = cleanType_(payload.type);
  if (!orderNumber || !type) return output_({ ok: false, code: "INVALID_INPUT" }, 400);

  const order = findEligibleOrder_(orderNumber, type);
  if (!order) return output_({ ok: false, code: "ORDER_NOT_ELIGIBLE" }, 400);
  if (hasSubmittedInquiry_(orderNumber)) return output_({ ok: false, code: "ALREADY_USED" }, 409);
  return output_({ ok: true, challenge: createArithmeticChallenge_() });
}

function submitInquiry_(payload) {
  const orderNumber = cleanText_(payload.orderNumber, 80);
  const type = cleanType_(payload.type);
  const name = cleanText_(payload.name, 80);
  const email = cleanText_(payload.email, 254).toLowerCase();
  const question = cleanText_(payload.question, 2000);
  const challengeToken = cleanText_(payload.challengeToken, 80);
  const challengeAnswer = cleanText_(payload.challengeAnswer, 3);
  if (!orderNumber || !type || !name || !isValidEmail_(email) || !question) {
    return output_({ ok: false, code: "INVALID_INPUT" }, 400);
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return output_({ ok: false, code: "RATE_LIMITED" }, 429);
  try {
    const order = findEligibleOrder_(orderNumber, type);
    if (!order) return output_({ ok: false, code: "ORDER_NOT_ELIGIBLE" }, 400);
    if (order.email.toLowerCase() !== email) return output_({ ok: false, code: "EMAIL_MISMATCH" }, 400);
    if (hasSubmittedInquiry_(orderNumber)) return output_({ ok: false, code: "ALREADY_USED" }, 409);
    if (!verifyArithmeticChallenge_(challengeToken, challengeAnswer)) {
      return output_({ ok: false, code: "INVALID_CHALLENGE" }, 400);
    }

    const sheet = SpreadsheetApp.openById(TAROT_INQUIRY_CONFIG.spreadsheetId)
      .getSheetByName(TAROT_INQUIRY_CONFIG.inquiriesSheet);
    if (!sheet) return output_({ ok: false, code: "SERVICE_UNAVAILABLE" }, 500);
    const headers = sheet.getRange(1, 1, 1, TAROT_INQUIRY_CONFIG.inquiryHeaders.length).getDisplayValues()[0];
    if (headers.some((header, index) => header.trim() !== TAROT_INQUIRY_CONFIG.inquiryHeaders[index])) {
      return output_({ ok: false, code: "SERVICE_UNAVAILABLE" }, 500);
    }
    const nextRow = Math.max(sheet.getLastRow() + 1, 2);
    const values = [[
      safeCellText_(orderNumber),
      safeCellText_(email),
      safeCellText_(name),
      safeCellText_(question),
      type,
      "待處理",
    ]];
    sheet.getRange(nextRow, 1, 1, 6).setNumberFormat("@");
    sheet.getRange(nextRow, 1, 1, 6).setValues(values);
    return output_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function findEligibleOrder_(orderNumber, type) {
  const spreadsheet = SpreadsheetApp.openById(TAROT_INQUIRY_CONFIG.spreadsheetId);
  const sheet = spreadsheet.getSheetByName(TAROT_INQUIRY_CONFIG.ordersSheet);
  if (!sheet || sheet.getLastRow() < 2) return null;

  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0].map((value) => String(value).trim());
  const columns = Object.fromEntries(Object.entries(TAROT_INQUIRY_CONFIG.orderHeaders)
    .map(([key, header]) => [key, headers.indexOf(header)]));
  if (Object.values(columns).some((column) => column < 0)) return null;

  const target = normalizeOrderNumber_(orderNumber);
  const matchingRows = values.slice(1).filter((row) => normalizeOrderNumber_(row[columns.number]) === target);
  if (matchingRows.length !== 1) return null;
  const row = matchingRows[0];
  const total = parseAmount_(row[columns.total]);
  const threshold = type === "三張塔羅解讀" ? 300 : 100;
  if (String(row[columns.status]).trim() !== TAROT_INQUIRY_CONFIG.processedValue || total < threshold) return null;
  return { email: String(row[columns.email] || "").trim() };
}

function hasSubmittedInquiry_(orderNumber) {
  const sheet = SpreadsheetApp.openById(TAROT_INQUIRY_CONFIG.spreadsheetId)
    .getSheetByName(TAROT_INQUIRY_CONFIG.inquiriesSheet);
  if (!sheet || sheet.getLastRow() < 2) return false;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues();
  const target = normalizeOrderNumber_(orderNumber);
  return values.some(([value]) => normalizeOrderNumber_(value) === target);
}

function allowRequest_(clientIp) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, clientIp);
  const key = "tarot_inquiry_rate_v2_" + Utilities.base64EncodeWebSafe(digest).slice(0, 32);
  const cache = CacheService.getScriptCache();
  const current = Number(cache.get(key) || 0);
  if (current >= 10) return false;
  cache.put(key, String(current + 1), 60);
  return true;
}

function createArithmeticChallenge_() {
  const left = Math.floor(Math.random() * 9) + 1;
  const right = Math.floor(Math.random() * 9) + 1;
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put("tarot_inquiry_challenge_" + token, String(left + right), 600);
  return { token: token, left: left, right: right };
}

function verifyArithmeticChallenge_(token, answer) {
  if (!token || !/^\d{1,2}$/.test(answer)) return false;
  const cache = CacheService.getScriptCache();
  const key = "tarot_inquiry_challenge_" + token;
  const expected = cache.get(key);
  if (expected === null) return false;

  const attemptsKey = key + "_attempts";
  const attempts = Number(cache.get(attemptsKey) || 0);
  if (attempts >= 3) return false;
  if (Number(answer) !== Number(expected)) {
    cache.put(attemptsKey, String(attempts + 1), 600);
    return false;
  }

  cache.remove(key);
  cache.remove(attemptsKey);
  return true;
}

function hasValidSecret_(provided) {
  const expected = PropertiesService.getScriptProperties().getProperty("TAROT_INQUIRY_SECRET") || "";
  if (!expected || typeof provided !== "string" || provided.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ provided.charCodeAt(index);
  }
  return difference === 0;
}

function cleanType_(value) {
  return value === "單張塔羅解讀" || value === "三張塔羅解讀" ? value : "";
}

function cleanText_(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeOrderNumber_(value) {
  return String(value || "").trim().replace(/\s+/g, "").toUpperCase();
}

function parseAmount_(value) {
  const amount = Number(String(value || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeCellText_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function output_(value, status) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
