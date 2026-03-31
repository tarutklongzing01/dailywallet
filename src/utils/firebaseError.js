const firebaseErrorMap = {
  'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว',
  'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
  'auth/operation-not-allowed': 'ยังไม่ได้เปิดใช้งานวิธีเข้าสู่ระบบนี้ใน Firebase Authentication',
  'auth/popup-closed-by-user': 'ยกเลิกการเข้าสู่ระบบด้วย Google',
  'auth/unauthorized-domain':
    'โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Authentication กรุณาเพิ่มโดเมนที่ใช้งานจริงใน Authorized domains',
  'auth/too-many-requests': 'มีการพยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณาลองใหม่ภายหลัง',
  'auth/weak-password': 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัว และมีทั้งตัวอักษรกับตัวเลข',
  'auth/account-exists-with-different-credential': 'บัญชีนี้เคยผูกกับวิธีเข้าสู่ระบบแบบอื่นไว้แล้ว',
  'permission-denied':
    'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้ กรุณาตรวจสอบว่า Firestore Rules ถูก publish แล้ว และกำลังใช้งานด้วยบัญชีที่ถูกต้อง',
  'storage/unauthorized': 'คุณไม่มีสิทธิ์อัปโหลดหรือลบรูปสลิป กรุณาตรวจสอบ Firebase Storage Rules',
  'storage/canceled': 'ยกเลิกการอัปโหลดรูปสลิปแล้ว',
  'storage/retry-limit-exceeded': 'การอัปโหลดรูปสลิปหมดเวลาหรือพยายามซ้ำเกินกำหนด กรุณาลองใหม่',
  'storage/invalid-checksum': 'ไฟล์รูปสลิปอัปโหลดไม่สมบูรณ์ กรุณาลองใหม่อีกครั้ง',
  'storage/object-not-found': 'ไม่พบรูปสลิปที่ต้องการ',
  unavailable: 'ระบบไม่สามารถเชื่อมต่อได้ชั่วคราว กรุณาลองใหม่',
};

export function getFirebaseErrorMessage(error) {
  if (!error) {
    return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  }

  return firebaseErrorMap[error.code] || error.message || 'เกิดข้อผิดพลาดบางอย่าง';
}
