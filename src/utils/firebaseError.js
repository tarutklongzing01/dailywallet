const firebaseErrorMap = {
  'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว',
  'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
  'auth/operation-not-allowed': 'ยังไม่ได้เปิดใช้งานวิธีเข้าสู่ระบบนี้ใน Firebase Authentication',
  'auth/popup-closed-by-user': 'ยกเลิกการเข้าสู่ระบบด้วย Google',
  'auth/unauthorized-domain':
    'โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Authentication กรุณาเพิ่มโดเมน vercel.app ของคุณใน Authorized domains',
  'auth/too-many-requests': 'มีการพยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณาลองใหม่ภายหลัง',
  'auth/weak-password': 'รหัสผ่านไม่ปลอดภัยเพียงพอ',
  'auth/account-exists-with-different-credential': 'บัญชีนี้มีวิธีเข้าสู่ระบบอื่นอยู่แล้ว',
  'permission-denied':
    'ยังเข้าถึง Firestore ไม่ได้ กรุณาตรวจสอบว่าได้สร้าง Firestore Database และ publish Security Rules แล้ว',
  'unavailable': 'ระบบไม่สามารถเชื่อมต่อได้ชั่วคราว กรุณาลองใหม่',
};

export function getFirebaseErrorMessage(error) {
  if (!error) {
    return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  }

  return firebaseErrorMap[error.code] || error.message || 'เกิดข้อผิดพลาดบางอย่าง';
}
