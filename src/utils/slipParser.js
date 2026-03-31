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

const thaiMonthMap = {
  'ม.ค': 1,
  'มกราคม': 1,
  'ก.พ': 2,
  'กุมภาพันธ์': 2,
  'มี.ค': 3,
  'มีนาคม': 3,
  'เม.ย': 4,
  'เมษายน': 4,
  'พ.ค': 5,
  'พฤษภาคม': 5,
  'มิ.ย': 6,
  'มิถุนายน': 6,
  'ก.ค': 7,
  'กรกฎาคม': 7,
  'ส.ค': 8,
  'สิงหาคม': 8,
  'ก.ย': 9,
  'กันยายน': 9,
  'ต.ค': 10,
  'ตุลาคม': 10,
  'พ.ย': 11,
  'พฤศจิกายน': 11,
  'ธ.ค': 12,
  'ธันวาคม': 12,
};

const incomeHints = ['เงินเข้า', 'รับเงิน', 'รับโอน', 'credit', 'deposit', 'incoming'];
const expenseHints = ['โอนเงิน', 'โอนออก', 'ถอนเงิน', 'debit', 'payment', 'ถอน', 'ชำระ', 'จ่าย', 'จ่ายบิล'];
const noteLabelRegex = /(?:บันทึก(?:ช่วยจำ)?|หมายเหตุ|โน้ต|โน๊ต|note|memo|message|ข้อความถึงผู้รับ|ข้อความถึงผู้โอน)/i;

function normalizeThaiDigits(value = '') {
  return value.replace(/[๐-๙]/g, (digit) => thaiDigitsMap[digit] || digit);
}

function normalizeText(rawText = '') {
  return normalizeThaiDigits(rawText)
    .replace(/\r/g, '\n')
    .replace(/[|¦]/g, '1')
    .replace(/[Oo]/g, '0')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeYear(year) {
  if (year < 100) {
    year = year >= 50 ? 2500 + year : 2000 + year;
  }

  if (year > 2400) {
    year -= 543;
  }

  return year;
}

function formatIsoDate(day, month, year) {
  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return '';
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function extractDate(text) {
  const numericMatched = text.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);

  if (numericMatched) {
    const day = Number(numericMatched[1]);
    const month = Number(numericMatched[2]);
    const year = normalizeYear(Number(numericMatched[3]));
    const isoDate = formatIsoDate(day, month, year);

    if (isoDate) {
      return isoDate;
    }
  }

  const textMatched = text.match(/(\d{1,2})\s+([ก-๙A-Za-z.]+)\s+(\d{2,4})/);

  if (!textMatched) {
    return '';
  }

  const day = Number(textMatched[1]);
  const monthToken = textMatched[2].replace(/\.+$/g, '');
  const month = thaiMonthMap[monthToken];

  if (!month) {
    return '';
  }

  const year = normalizeYear(Number(textMatched[3]));
  return formatIsoDate(day, month, year);
}

function normalizeMoneyValue(value) {
  const parsed = Number(value.replaceAll(',', ''));

  if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 100000000) {
    return '';
  }

  return parsed.toFixed(2);
}

function extractAmountFromLines(lines) {
  const amountLabelRegex = /(?:จำนวน|ยอด(?:เงิน)?|amount|total|paid)/i;
  const feeLabelRegex = /(?:ค่าธรรมเนียม|fee)/i;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!amountLabelRegex.test(line) || feeLabelRegex.test(line)) {
      continue;
    }

    const sameLine = line.match(/([0-9][0-9,]*(?:\.\d{1,2})?)/);

    if (sameLine) {
      const amount = normalizeMoneyValue(sameLine[1]);

      if (amount) {
        return amount;
      }
    }

    const nextLine = lines[index + 1] || '';
    const nextLineMatch = nextLine.match(/([0-9][0-9,]*(?:\.\d{1,2})?)/);

    if (nextLineMatch) {
      const amount = normalizeMoneyValue(nextLineMatch[1]);

      if (amount) {
        return amount;
      }
    }
  }

  return '';
}

function extractAmount(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const labeledAmount = extractAmountFromLines(lines);

  if (labeledAmount) {
    return labeledAmount;
  }

  const bahtMatches = [...text.matchAll(/([0-9][0-9,]*(?:\.\d{1,2})?)\s*บาท/g)]
    .map((match) => normalizeMoneyValue(match[1]))
    .filter(Boolean);

  if (bahtMatches.length) {
    return bahtMatches.sort((left, right) => Number(right) - Number(left))[0];
  }

  const numericMatches = [...text.matchAll(/\d{1,3}(?:,\d{3})*(?:\.\d{2})|\d+(?:\.\d{2})/g)]
    .map((match) => normalizeMoneyValue(match[0]))
    .filter(Boolean);

  if (!numericMatches.length) {
    return '';
  }

  return numericMatches.sort((left, right) => Number(right) - Number(left))[0];
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

function cleanNote(value = '') {
  return value.replace(/^[:：\-\s]+/, '').trim().slice(0, 180);
}

function isLikelyNote(value = '') {
  if (!value) {
    return false;
  }

  if (/^[\d\s,./:-]+$/.test(value)) {
    return false;
  }

  if (/(?:บาท|ค่าธรรมเนียม|fee|เลขที่รายการ|transaction|xxx-x|qr|scan)/i.test(value)) {
    return false;
  }

  return value.length >= 2;
}

function extractNote(text) {
  const inlineNote = text.match(
    /(?:บันทึก(?:ช่วยจำ)?|หมายเหตุ|โน้ต|โน๊ต|note|memo|message|ข้อความถึงผู้รับ|ข้อความถึงผู้โอน)\s*[:：-]?\s*([^\n]+)/i,
  );

  if (inlineNote) {
    const cleaned = cleanNote(inlineNote[1]);

    if (isLikelyNote(cleaned)) {
      return cleaned;
    }
  }

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  for (let index = 0; index < lines.length; index += 1) {
    if (!noteLabelRegex.test(lines[index])) {
      continue;
    }

    const nextLine = cleanNote(lines[index + 1] || '');

    if (isLikelyNote(nextLine)) {
      return nextLine;
    }
  }

  return '';
}

export function parseSlipText(rawText = '') {
  const text = normalizeText(rawText);

  return {
    text,
    date: extractDate(text),
    amount: extractAmount(text),
    type: inferType(text),
    description: extractNote(text),
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
