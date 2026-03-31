const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export function validateEmail(email) {
  if (!email?.trim()) {
    return 'กรุณากรอกอีเมล';
  }

  if (!emailPattern.test(email.trim())) {
    return 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  return '';
}

export function validatePassword(password) {
  if (!password) {
    return 'กรุณากรอกรหัสผ่าน';
  }

  if (!passwordPattern.test(password)) {
    return 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัว และมีทั้งตัวอักษรกับตัวเลข';
  }

  return '';
}

export function validateLoginForm(values) {
  return {
    email: validateEmail(values.email),
    password: values.password ? '' : 'กรุณากรอกรหัสผ่าน',
  };
}

export function validateRegisterForm(values) {
  const passwordError = validatePassword(values.password);

  return {
    displayName: values.displayName?.trim() ? '' : 'กรุณากรอกชื่อที่ใช้แสดง',
    email: validateEmail(values.email),
    password: passwordError,
    confirmPassword: values.confirmPassword === values.password ? '' : 'รหัสผ่านยืนยันไม่ตรงกัน',
  };
}

export function validateTransactionForm(values) {
  const resolvedCategory =
    values.category === '__custom__' ? values.customCategory?.trim() : values.category?.trim();

  return {
    date: values.date ? '' : 'กรุณาเลือกวันที่',
    type: values.type ? '' : 'กรุณาเลือกประเภทรายการ',
    category: resolvedCategory ? '' : 'กรุณาเลือกหรือกรอกหมวดหมู่',
    description: values.description?.trim() ? '' : 'กรุณากรอกรายละเอียด',
    amount:
      Number(values.amount) > 0 ? '' : 'จำนวนเงินต้องมากกว่า 0',
  };
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
