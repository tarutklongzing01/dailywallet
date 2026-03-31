# รายรับรายจ่ายประจำวัน

เว็บแอปบันทึกรายรับรายจ่ายประจำวันแบบครบระบบ สร้างด้วย React + Vite + Firebase รองรับ UI ภาษาไทย, Authentication, Firestore, Dashboard, กราฟสรุปผล, export CSV, dark mode และ deploy ได้ง่ายทั้ง Firebase Hosting, Vercel และ Netlify

## Architecture

### Stack ที่ใช้

- Frontend: React 19 + Vite
- Routing: React Router
- Database/Auth: Firebase Authentication + Cloud Firestore
- Chart: Chart.js + react-chartjs-2
- Styling: CSS แยกไฟล์แบบอ่านง่าย
- Deploy: Firebase Hosting, Vercel, Netlify

### แนวคิดโครงสร้าง

- ใช้ SPA เพื่อให้ flow login -> dashboard -> เพิ่ม/แก้ไขรายการ ลื่นและดูแลง่าย
- แยก `pages`, `components`, `services`, `utils`, `context`, `hooks` ชัดเจน
- ให้ Firestore เก็บข้อมูลแบบ flat collections ตาม requirement คือ `users`, `transactions`, `categories`
- ทุก query ฝั่ง client อิง `uid` ของผู้ใช้ที่ login อยู่
- ใช้ protected route กันผู้ใช้ที่ยังไม่ login ไม่ให้เข้าหน้าระบบ
- ใช้ Firebase session persistence ของ browser เพื่อจำการเข้าสู่ระบบ

### Firestore Collections

#### `users/{uid}`

```json
{
  "uid": "USER_UID",
  "email": "demo@example.com",
  "displayName": "Demo User",
  "photoURL": "",
  "provider": "password",
  "theme": "light",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### `transactions/{transactionId}`

```json
{
  "uid": "USER_UID",
  "date": "2026-03-31",
  "type": "รายจ่าย",
  "category": "อาหาร",
  "description": "ข้าวกลางวัน",
  "amount": 120,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### `categories/{categoryId}`

```json
{
  "uid": "USER_UID",
  "type": "รายจ่าย",
  "name": "อาหาร",
  "isDefault": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## ฟีเจอร์ที่มีแล้ว

- สมัครสมาชิกด้วย Email/Password
- Login ด้วย Email/Password
- Login ด้วย Google
- Logout
- จำ session การ login
- Protected route สำหรับหน้า dashboard และหน้าจัดการข้อมูล
- เพิ่ม, แก้ไข, ลบ รายการรายรับรายจ่าย
- หมวดหมู่พื้นฐานสร้างให้อัตโนมัติเมื่อใช้งานครั้งแรก
- เพิ่มหมวดหมู่เองได้ทั้งจากหน้าเพิ่มรายการและหน้าโปรไฟล์
- Dashboard สรุปยอดวันนี้และเดือนนี้
- ฟิลเตอร์ตามวัน, เดือน, ประเภท, หมวดหมู่ และค้นหาจากรายละเอียด
- กราฟรายวัน, กราฟสัดส่วนหมวดหมู่รายจ่าย, กราฟสรุปรายเดือน
- Export CSV
- Toast notification ภาษาไทย
- Dark mode
- Mock data สำหรับทดสอบระบบ

## โครงสร้างไฟล์

```text
.
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ app/
│  │  ├─ App.jsx
│  │  └─ router.jsx
│  ├─ components/
│  │  ├─ charts/
│  │  │  ├─ DailyIncomeExpenseChart.jsx
│  │  │  ├─ ExpenseCategoryChart.jsx
│  │  │  └─ MonthlySummaryChart.jsx
│  │  ├─ AppShell.jsx
│  │  ├─ AuthLayout.jsx
│  │  ├─ ConfirmModal.jsx
│  │  ├─ EmptyState.jsx
│  │  ├─ FilterBar.jsx
│  │  ├─ LoadingScreen.jsx
│  │  ├─ ProtectedRoute.jsx
│  │  ├─ PublicOnlyRoute.jsx
│  │  ├─ SummaryCard.jsx
│  │  ├─ ThemeToggle.jsx
│  │  ├─ ToastViewport.jsx
│  │  ├─ TransactionForm.jsx
│  │  ├─ TransactionTable.jsx
│  │  └─ UserMenu.jsx
│  ├─ config/
│  │  └─ firebase-config.js
│  ├─ constants/
│  │  └─ categories.js
│  ├─ context/
│  │  ├─ AuthContext.jsx
│  │  ├─ ThemeContext.jsx
│  │  └─ ToastContext.jsx
│  ├─ data/
│  │  ├─ mock-categories.json
│  │  └─ mock-transactions.json
│  ├─ hooks/
│  │  ├─ useAuth.js
│  │  ├─ useTheme.js
│  │  ├─ useToast.js
│  │  ├─ useUserCategories.js
│  │  └─ useUserTransactions.js
│  ├─ pages/
│  │  ├─ DashboardPage.jsx
│  │  ├─ LoginPage.jsx
│  │  ├─ NotFoundPage.jsx
│  │  ├─ ProfilePage.jsx
│  │  ├─ RegisterPage.jsx
│  │  ├─ TransactionCreatePage.jsx
│  │  └─ TransactionEditPage.jsx
│  ├─ services/
│  │  ├─ authService.js
│  │  ├─ categoryService.js
│  │  ├─ profileService.js
│  │  └─ transactionService.js
│  ├─ styles/
│  │  ├─ base.css
│  │  ├─ components.css
│  │  └─ theme.css
│  ├─ utils/
│  │  ├─ chartSetup.js
│  │  ├─ csv.js
│  │  ├─ currency.js
│  │  ├─ date.js
│  │  ├─ firebaseError.js
│  │  ├─ transactionStats.js
│  │  └─ validation.js
│  ├─ main.jsx
│  └─ ...
├─ .env.example
├─ firebase.json
├─ firestore.indexes.json
├─ firestore.rules
├─ netlify.toml
├─ package.json
├─ vercel.json
└─ vite.config.js
```

## วิธีติดตั้ง

### 1. ติดตั้ง Node.js

- แนะนำ Node.js 20 ขึ้นไป

### 2. ติดตั้ง dependencies

```bash
npm install
```

### 3. สร้างไฟล์ `.env`

- คัดลอกจาก `.env.example`
- ใส่ Firebase config จริงของโปรเจกต์คุณ

ตัวอย่าง:

```bash
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### ตำแหน่งไฟล์ config

- ไฟล์ที่อ่านค่า config คือ [src/config/firebase-config.js](./src/config/firebase-config.js)
- จุดที่ต้องนำ Firebase config ของจริงมาใส่คือไฟล์ `.env`

## วิธีตั้งค่า Firebase แบบละเอียด

### 1. สร้าง Firebase Project

1. ไปที่ Firebase Console
2. กด `Add project`
3. ตั้งชื่อโปรเจกต์
4. รอ Firebase สร้างโปรเจกต์ให้เสร็จ

### 2. เปิด Web App

1. ในหน้า Project Overview กดไอคอน `</>`
2. ตั้งชื่อแอปเว็บ
3. ระบบจะโชว์ Firebase config
4. นำค่าที่ได้มาใส่ใน `.env`

### 3. เปิด Authentication

1. ไปที่ `Build > Authentication`
2. กด `Get started`
3. เปิด provider ดังนี้
   - `Email/Password`
   - `Google`
4. ถ้า deploy แล้ว อย่าลืมเพิ่ม domain ที่ใช้จริงใน Authorized domains

### 4. เปิด Firestore Database

1. ไปที่ `Build > Firestore Database`
2. กด `Create database`
3. เลือกโหมดเริ่มต้นได้ตามสะดวก แล้วค่อย deploy rules ของโปรเจกต์นี้ทับ
4. เลือก region ที่ใกล้ผู้ใช้

### 5. ใส่ Security Rules

- โปรเจกต์นี้มี rules พร้อมแล้วใน [firestore.rules](./firestore.rules)
- หลังติดตั้ง Firebase CLI แล้ว deploy ได้ด้วย:

```bash
firebase deploy --only firestore:rules
```

### 6. เชื่อม Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy
```

ไฟล์ [firebase.json](./firebase.json) ถูกตั้ง rewrite สำหรับ SPA ไว้แล้ว

## วิธีรันโปรเจกต์

### สำคัญก่อนรัน

- โปรเจกต์นี้เป็น `React + Vite`
- ห้ามเปิดด้วย Live Server แบบ `127.0.0.1:5500/index.html`
- ต้องรันผ่าน Vite dev server เท่านั้น ไม่เช่นนั้น browser จะอ่านไฟล์ JSX ไม่ได้และหน้าอาจขาว

### Development

```bash
npm run dev
```

ถ้ายังไม่ได้ตั้งค่า `.env` ระบบจะขึ้นหน้า setup อัตโนมัติและบอกรายการ key ที่ยังขาดอยู่

เปิดเบราว์เซอร์ที่:

```text
http://localhost:5173
```

### Production Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## วิธี deploy

### Firebase Hosting

```bash
npm run build
firebase deploy
```

### Vercel

1. push โปรเจกต์ขึ้น Git repository
2. import โปรเจกต์ใน Vercel
3. Vercel จะ detect ว่าเป็น Vite ได้เอง แต่ในโปรเจกต์นี้มี [vercel.json](./vercel.json) กำหนด `framework`, `buildCommand`, `outputDirectory` และ SPA rewrite ไว้แล้ว
4. เพิ่ม Environment Variables ชุดเดียวกับ `.env`
5. deploy production เพื่อให้ได้โดเมนถาวรลักษณะ `your-project.vercel.app`

ไฟล์ [vercel.json](./vercel.json) ถูกใส่ rewrite สำหรับ route ของ React แล้ว

### สิ่งสำคัญมากเมื่อใช้ `vercel.app` กับ Firebase Auth

ถ้าคุณใช้โดเมนจาก Vercel เช่น `your-project.vercel.app` และต้องการให้ Google Login ทำงาน:

1. ไปที่ Firebase Console
2. เปิด `Authentication`
3. เข้าเมนู `Settings` หรือหน้า `Authorized domains`
4. เพิ่มโดเมน production ของคุณ เช่น `your-project.vercel.app`

ถ้าไม่เพิ่มโดเมนนี้ Google Login จะขึ้น error แนว `auth/unauthorized-domain`

หมายเหตุ:

- จากเอกสาร Firebase การใช้งาน OAuth บนเว็บต้องตั้งค่า authorized domains ให้ตรงกับโดเมนที่ใช้จริง
- จากเอกสาร Vercel โปรเจกต์ Vite deploy แบบ static ได้ตรงๆ และใช้ `vercel.json` สำหรับ SPA rewrite ได้
- สำหรับ preview deployment ของ Vercel บางครั้งโดเมนจะเปลี่ยนตาม branch/commit ดังนั้นถ้าต้องการให้ Google Login เสถียรที่สุด แนะนำใช้ production domain หลักหรือ custom domain เดียว

### Netlify

1. push โปรเจกต์ขึ้น Git repository
2. import โปรเจกต์ใน Netlify
3. ตั้ง Build Command เป็น `npm run build`
4. ตั้ง Publish directory เป็น `dist`
5. เพิ่ม Environment Variables ชุดเดียวกับ `.env`

ไฟล์ [netlify.toml](./netlify.toml) ถูกใส่ redirect สำหรับ SPA แล้ว

## วิธีใช้งาน mock data

หลัง login แล้ว:

1. ไปหน้า `โปรไฟล์`
2. กด `เพิ่มข้อมูลตัวอย่าง`
3. ถ้าต้องการหมวดหมู่เพิ่ม กด `เพิ่มหมวดหมู่แนะนำ`

ไฟล์ mock อยู่ที่:

- [src/data/mock-transactions.json](./src/data/mock-transactions.json)
- [src/data/mock-categories.json](./src/data/mock-categories.json)

## Security Rules ที่โปรเจกต์นี้บังคับไว้

- ผู้ใช้ต้อง login ก่อนจึงจะอ่านหรือเขียนข้อมูลได้
- ผู้ใช้เข้าถึง `users/{uid}` ได้เฉพาะของตัวเอง
- ผู้ใช้เข้าถึง `transactions` ได้เฉพาะเอกสารที่ `uid` ตรงกับ `request.auth.uid`
- ผู้ใช้เข้าถึง `categories` ได้เฉพาะเอกสารที่ `uid` ตรงกับ `request.auth.uid`
- validation เบื้องต้นถูกเช็กใน rules เช่น type, amount, date format และ required fields

## หมายเหตุสำหรับการต่อยอด

- ถ้าต้องการ scale มากขึ้น อาจเพิ่ม pagination หรือ index สำหรับ query ขั้นสูง
- สามารถเพิ่มหน้า reports แยกเฉพาะ หรือ export PDF ต่อจากโครงสร้างนี้ได้
- ถ้าต้องการ profile image, reset password, หรือ category delete/edit สามารถต่อยอดจาก service เดิมได้ง่าย

## ไฟล์สำคัญที่ควรเริ่มอ่าน

- [src/app/router.jsx](./src/app/router.jsx)
- [src/context/AuthContext.jsx](./src/context/AuthContext.jsx)
- [src/pages/DashboardPage.jsx](./src/pages/DashboardPage.jsx)
- [src/components/TransactionForm.jsx](./src/components/TransactionForm.jsx)
- [src/services/transactionService.js](./src/services/transactionService.js)
- [src/config/firebase-config.js](./src/config/firebase-config.js)

## อัปเดตฟีเจอร์แนบสลิปและอ่านอัตโนมัติ

- ฟอร์มเพิ่ม/แก้ไขรายการสามารถแนบรูปสลิปได้
- ระบบจะใช้ OCR อ่านข้อความจากสลิป และพยายามเติม `วันที่`, `จำนวนเงิน`, `ประเภทรายการ` ให้อัตโนมัติ
- ข้อมูลรูปจะถูกเก็บใน Firebase Storage ที่ path รูปแบบ `receipts/{uid}/...`
- ใน `transactions` จะบันทึกข้อมูลเพิ่มได้คือ `receiptImageUrl`, `receiptImagePath`, `receiptOcrText`
- หน้าตารางรายการมีลิงก์ `ดูสลิป` สำหรับเปิดรูปแนบย้อนหลัง

### สิ่งที่ต้องตั้งค่าเพิ่มสำหรับฟีเจอร์นี้

1. เปิดใช้งาน Firebase Storage ในโปรเจกต์เดียวกับ Firestore
2. publish ไฟล์ [storage.rules](./storage.rules)
3. deploy rules ใหม่ด้วยคำสั่ง:

```bash
firebase deploy --only firestore:rules,storage
```

### หมายเหตุของ OCR

- การอ่านสลิปเป็นการช่วยกรอกอัตโนมัติ ไม่ควรใช้แทนการตรวจสอบด้วยสายตา
- สลิปที่ชัด, ตรง, และมีแสงพอ จะอ่านได้แม่นยำกว่า
- ถ้า OCR อ่านไม่ครบ ยังสามารถกรอกข้อมูลเองและบันทึกได้ตามปกติ
