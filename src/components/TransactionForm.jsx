import { useEffect, useState } from 'react';
import { TRANSACTION_TYPES } from '../constants/categories';
import { getTodayDateString } from '../utils/date';
import { hasErrors, validateTransactionForm } from '../utils/validation';

const defaultValues = {
  date: getTodayDateString(),
  type: 'รายจ่าย',
  category: '',
  customCategory: '',
  description: '',
  amount: '',
};

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

  useEffect(() => {
    setValues({
      ...defaultValues,
      ...initialValues,
    });
  }, [initialValues]);

  const availableCategories = categories.filter((category) => category.type === values.type);
  const useCustomCategory = values.category === '__custom__';

  const handleChange = (field, nextValue) => {
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

    setErrors({});
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
          <p>เลือกให้ชัดเจนเพื่อสรุปยอดและกราฟได้ถูกต้อง</p>
        </div>

        <div className="type-toggle">
          {TRANSACTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`type-toggle__button ${values.type === type ? 'is-active' : ''} ${
                type === 'รายรับ' ? 'is-income' : 'is-expense'
              }`}
              onClick={() => handleTypeChange(type)}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.type ? <small className="field-error">{errors.type}</small> : null}
      </div>

      <div className="form-grid">
        <label className="field">
          <span>วันที่</span>
          <input type="date" value={values.date} onChange={(event) => handleChange('date', event.target.value)} />
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
            onChange={(event) => handleChange('amount', event.target.value)}
          />
          {errors.amount ? <small className="field-error">{errors.amount}</small> : null}
        </label>

        <label className="field">
          <span>หมวดหมู่</span>
          <select value={values.category} onChange={(event) => handleChange('category', event.target.value)}>
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
              onChange={(event) => handleChange('customCategory', event.target.value)}
            />
          </label>
        ) : null}

        <label className="field field--full">
          <span>รายละเอียด</span>
          <textarea
            rows="4"
            placeholder="เช่น ค่าอาหารกลางวัน, รับเงินเดือนงวดเดือนมีนาคม"
            value={values.description}
            onChange={(event) => handleChange('description', event.target.value)}
          />
          {errors.description ? <small className="field-error">{errors.description}</small> : null}
        </label>
      </div>

      <div className="form-card__actions">
        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? 'กำลังบันทึก...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;
