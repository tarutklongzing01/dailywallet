let workerPromise = null;

const thaiDigitsMap = {
  '๐': '0',
  '๑': '1',
  '๒': '2',
  '๓': '3',
  '๔': '4',
  '๕': '5',
  '๖': '6',
  '๗': '7',
  '๘': '8',
  '๙': '9',
};

const incomeHints = ['เงินเข้า', 'รับเงิน', 'รับโอน', 'credit', 'deposit', 'incoming'];
const expenseHints = ['โอนเงิน', 'โอนออก', 'ถอนเงิน', 'debit', 'payment', 'ถอน', 'ชำระ'];

function normalizeThaiDigits(value = '') {
  return value.replace(/[๐-๙]/g, (digit) => thaiDigitsMap[digit] || digit);
}

function normalizeText(rawText = '') {
  return normalizeThaiDigits(rawText)
    .replace(/\r/g, '\n')
    .replace(/\|/g, '1')
    .replace(/[Oo]/g, '0')
    .trim();
}

function extractDate(text) {
  const matched = text.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);

  if (!matched) {
    return '';
  }

  const day = Number(matched[1]);
  const month = Number(matched[2]);
  let year = Number(matched[3]);

  if (year < 100) {
    year += 2000;
  }

  if (year > 2400) {
    year -= 543;
  }

  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return '';
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function extractAmount(text) {
  const matches = [...text.matchAll(/\d{1,3}(?:,\d{3})*(?:\.\d{2})|\d+(?:\.\d{2})/g)]
    .map((match) => Number(match[0].replaceAll(',', '')))
    .filter((value) => Number.isFinite(value) && value > 0 && value < 100000000);

  if (!matches.length) {
    return '';
  }

  return String(Math.max(...matches));
}

function inferType(text) {
  const normalized = text.toLowerCase();

  if (incomeHints.some((hint) => normalized.includes(hint))) {
    return 'รายรับ';
  }

  if (expenseHints.some((hint) => normalized.includes(hint))) {
    return 'รายจ่าย';
  }

  return '';
}

function buildDescription(rawText = '') {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^[\d\s,./:-]+$/.test(line));

  if (!lines.length) {
    return 'แนบสลิป';
  }

  return lines.slice(0, 3).join(' | ').slice(0, 180);
}

export function parseSlipText(rawText = '') {
  const text = normalizeText(rawText);

  return {
    text,
    date: extractDate(text),
    amount: extractAmount(text),
    type: inferType(text),
    description: buildDescription(text),
  };
}

async function getWorker() {
  if (!workerPromise) {
    workerPromise = import('tesseract.js').then(({ createWorker }) => createWorker('tha+eng'));
  }

  return workerPromise;
}

export async function recognizeSlipImage(file) {
  try {
    const worker = await getWorker();
    const result = await worker.recognize(file);

    return {
      text: result.data.text,
      parsed: parseSlipText(result.data.text),
    };
  } catch {
    throw new Error('ยังอ่านข้อความจากสลิปไม่ได้ กรุณาลองใหม่อีกครั้ง หรือกรอกข้อมูลด้วยตนเอง');
  }
}
