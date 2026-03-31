import { missingFirebaseConfigKeys } from '../config/firebase-config';

function FirebaseSetupScreen() {
  return (
    <div className="setup-screen">
      <div className="setup-screen__card">
        <span className="section-pill">ต้องตั้งค่า Firebase ก่อน</span>
        <h1>แอปบูตขึ้นแล้ว แต่ยังไม่ได้ใส่ค่าในไฟล์ `.env`</h1>
        <p>
          โปรเจกต์นี้เชื่อม Firebase Authentication และ Firestore ตั้งแต่เริ่มต้น
          ถ้ายังไม่ได้ใส่ค่า config จริง ระบบจะยังไม่เปิดหน้า login/dashboard เพื่อกัน error ตอนรัน
        </p>

        <div className="setup-screen__steps">
          <div>
            <strong>1. สร้างไฟล์ `.env`</strong>
            <p>คัดลอกจาก `.env.example` ใน root ของโปรเจกต์</p>
          </div>

          <div>
            <strong>2. ใส่ Firebase Web Config</strong>
            <p>
              เอาค่าจาก Firebase Console {'>'} Project settings {'>'} Your apps
            </p>
          </div>

          <div>
            <strong>3. รีสตาร์ต dev server</strong>
            <p>หยุด `npm run dev` แล้วรันใหม่อีกครั้งหลังแก้ `.env`</p>
          </div>
        </div>

        <div className="setup-screen__missing">
          <strong>ค่าที่ยังขาดอยู่:</strong>
          <ul>
            {missingFirebaseConfigKeys.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FirebaseSetupScreen;
