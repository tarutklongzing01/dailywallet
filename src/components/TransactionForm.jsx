import { useEffect, useMemo, useState } from 'react';
import { TRANSACTION_TYPES } from '../constants/categories';
import { getTodayDateString } from '../utils/date';
import { recognizeSlipImage } from '../utils/slipParser';
import { hasErrors, validateReceiptFile, validateTransactionForm } from '../utils/validation';

const defaultValues = {
  date: getTodayDateString(),
  type: TRANSACTION_TYPES[1] || '',
  category: '',
  customCategory: '',
  description: '',
  amount: '',
  receiptFile: null,
  receiptImageUrl: '',
  receiptImagePath: '',
  receiptOcrText: '',
  clearReceipt: false,
};

function buildAutoFillSummary(parsed) {
  const chunks = [];

  if (parsed.date) {
    chunks.push(`วันที่ ${parsed.date}`);
  }

  if (parsed.amount) {
    chunks.push(`ยอด ${parsed.amount} บาท`);
  }

  if (parsed.type) {
    chunks.push(`ประเภท ${parsed.type}`);
  }

  if (parsed.description) {
    chunks.push(`โน้ต ${parsed.description}`);
  }

  return chunks.join(' • ');
}

function TransactionForm({
  initialValues,
  categories,
  submitting = false,
  submitLabel = 'บันทึกรายการ',
  onSubmit,
}) {
  const [values, setValues] = useState({
    ...defaultValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState({});
  const [slipPreviewUrl, setSlipPreviewUrl] = useState(initialValues?.receiptImageUrl || '');
  const [slipScanResult, setSlipScanResult] = useState(initialValues?.receiptOcrText || '');
  const [slipAutoFillSummary, setSlipAutoFillSummary] = useState('');
  const [readingSlip, setReadingSlip] = useState(false);

  useEffect(() => {
    setValues({
      ...defaultValues,
      ...initialValues,
    });
    setSlipPreviewUrl(initialValues?.receiptImageUrl || '');
    setSlipScanResult(initialValues?.receiptOcrText || '');
    setSlipAutoFillSummary('');
  }, [initialValues]);

  useEffect(() => {
    return () => {
      if (slipPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(slipPreviewUrl);
      }
    };
  }, [slipPreviewUrl]);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === values.type),
    [categories, values.type],
  );

  const useCustomCategory = values.category === '__custom__';

  const updateValue = (field, nextValue) => {
    setValues((current) => ({
      ...current,
      [field]: nextValue,
    }));
    setErrors((current) => ({
      ...current,
      [field]: '',
    }));
  };

  const handleTypeChange = (nextType) => {
    setValues((current) => ({
      ...current,
      type: nextType,
      category: '',
      customCategory: '',
    }));
    setErrors((current) => ({
      ...current,
      type: '',
      category: '',
    }));
  };

  const handleSlipRead = async (file) => {
    if (!file) {
      return;
    }

    setReadingSlip(true);
    setErrors((current) => ({
      ...current,
      receiptFile: '',
    }));

    try {
      const { text, parsed } = await recognizeSlipImage(file);

      setSlipScanResult(text);
      setSlipAutoFillSummary(buildAutoFillSummary(parsed));
      setValues((current) => {
        const nextType = parsed.type || current.type;
        const typeChanged = Boolean(parsed.type) && parsed.type !== current.type;

        return {
          ...current,
          type: nextType,
          date: parsed.date || current.date,
          amount: parsed.amount || current.amount,
          description: current.description?.trim() ? current.description : parsed.description || '',
          category: typeChanged ? '' : current.category,
          customCategory: typeChanged ? '' : current.customCategory,
          receiptOcrText: text,
          clearReceipt: false,
        };
      });
    } catch (error) {
      setSlipAutoFillSummary('');
      setErrors((current) => ({
        ...current,
        receiptFile: error?.message || 'ยังอ่านข้อความจากสลิปไม่ได้ กรุณาลองใหม่หรือกรอกเอง',
      }));
    } finally {
      setReadingSlip(false);
    }
  };

  const handleReceiptChange = async (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    const fileError = validateReceiptFile(file);

    if (fileError) {
      setErrors((current) => ({
        ...current,
        receiptFile: fileError,
      }));
      return;
    }

    if (slipPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(slipPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);

    setSlipPreviewUrl(previewUrl);
    setSlipScanResult('');
    setSlipAutoFillSummary('');
    setErrors((current) => ({
      ...current,
      receiptFile: '',
    }));
    setValues((current) => ({
      ...current,
      receiptFile: file,
      receiptImageUrl: '',
      receiptImagePath: '',
      receiptOcrText: '',
      clearReceipt: false,
    }));

    await handleSlipRead(file);
  };

  const handleRemoveReceipt = () => {
    if (slipPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(slipPreviewUrl);
    }

    setSlipPreviewUrl('');
    setSlipScanResult('');
    setSlipAutoFillSummary('');
    setValues((current) => ({
      ...current,
      receiptFile: null,
      receiptImageUrl: '',
      receiptImagePath: '',
      receiptOcrText: '',
      clearReceipt: true,
    }));
    setErrors((current) => ({
      ...current,
      receiptFile: '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateTransactionForm(values);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    const resolvedCategory =
      values.category === '__custom__' ? values.customCategory.trim() : values.category.trim();

    await onSubmit({
      ...values,
      category: resolvedCategory,
      amount: Number(values.amount),
    });
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-card__section">
        <div className="form-card__section-head">
          <h2>ประเภทรายการ</h2>
          <p>เลือกว่าเป็นรายรับหรือรายจ่าย เพื่อให้ยอดสรุปและกราฟคำนวณได้ถูกต้อง</p>
        </div>

        <div className="type-toggle">
          {TRANSACTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`type-toggle__button ${values.type === type ? 'is-active' : ''} ${
                type === TRANSACTION_TYPES[0] ? 'is-income' : 'is-expense'
              }`}
              onClick={() => handleTypeChange(type)}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.type ? <small className="field-error">{errors.type}</small> : null}
      </div>

      <div className="form-card__section">
        <div className="form-card__section-head">
          <h2>แนบสลิปและอ่านอัตโนมัติ</h2>
          <p>ระบบจะพยายามอ่านยอดเงิน วันที่ และเดาประเภทรายการจากรูปสลิปให้โดยอัตโนมัติ</p>
        </div>

        <div className="receipt-card">
          <label className="field">
            <span>รูปสลิป</span>
            <input type="file" accept="image/*" onChange={handleReceiptChange} />
            <small className="field-help">
              รองรับไฟล์รูปภาพไม่เกิน 10 MB ระบบจะเติมรายละเอียดให้อัตโนมัติเฉพาะเมื่อเจอ note หรือหมายเหตุจริงบนสลิป
            </small>
            {errors.receiptFile ? <small className="field-error">{errors.receiptFile}</small> : null}
          </label>

          {slipPreviewUrl ? (
            <div className="receipt-card__preview">
              <img src={slipPreviewUrl} alt="ตัวอย่างสลิปที่แนบ" />
              <div className="receipt-card__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => handleSlipRead(values.receiptFile)}
                  disabled={readingSlip || !values.receiptFile}
                >
                  {readingSlip ? 'กำลังอ่านสลิป...' : 'อ่านสลิปอีกครั้ง'}
                </button>
                <button type="button" className="button button--ghost" onClick={handleRemoveReceipt}>
                  ลบรูปที่แนบ
                </button>
              </div>
            </div>
          ) : null}

          {readingSlip ? <div className="receipt-card__hint">กำลังอ่านข้อความจากสลิป กรุณารอสักครู่...</div> : null}
          {slipAutoFillSummary ? (
            <div className="receipt-card__hint receipt-card__hint--success">อ่านสลิปแล้ว: {slipAutoFillSummary}</div>
          ) : null}
          {slipScanResult ? (
            <details className="receipt-card__ocr">
              <summary>ดูข้อความที่ OCR อ่านได้</summary>
              <pre>{slipScanResult}</pre>
            </details>
          ) : null}
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>วันที่</span>
          <input type="date" value={values.date} onChange={(event) => updateValue('date', event.target.value)} />
          {errors.date ? <small className="field-error">{errors.date}</small> : null}
        </label>

        <label className="field">
          <span>จำนวนเงิน</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={values.amount}
            onChange={(event) => updateValue('amount', event.target.value)}
          />
          {errors.amount ? <small className="field-error">{errors.amount}</small> : null}
        </label>

        <label className="field">
          <span>หมวดหมู่</span>
          <select value={values.category} onChange={(event) => updateValue('category', event.target.value)}>
            <option value="">เลือกหมวดหมู่</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
            <option value="__custom__">กำหนดเอง</option>
          </select>
          {errors.category ? <small className="field-error">{errors.category}</small> : null}
        </label>

        {useCustomCategory ? (
          <label className="field">
            <span>หมวดหมู่ใหม่</span>
            <input
              type="text"
              placeholder="เช่น สุขภาพ, โบนัส, การศึกษา"
              value={values.customCategory}
              onChange={(event) => updateValue('customCategory', event.target.value)}
            />
          </label>
        ) : null}

        <label className="field field--full">
          <span>รายละเอียด</span>
          <textarea
            rows="4"
            placeholder="ถ้าสลิปมี note ระบบจะเติมให้อัตโนมัติ ถ้าไม่มีสามารถพิมพ์เองได้"
            value={values.description}
            onChange={(event) => updateValue('description', event.target.value)}
          />
          {errors.description ? <small className="field-error">{errors.description}</small> : null}
        </label>
      </div>

      <div className="form-card__actions">
        <button type="submit" className="button button--primary" disabled={submitting || readingSlip}>
          {submitting ? 'กำลังบันทึก...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;
