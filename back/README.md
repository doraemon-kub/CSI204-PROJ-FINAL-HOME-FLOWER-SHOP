# 📚 คู่มือสำหรับทีม Frontend (Home Flowers Shop API)

เอกสารนี้สรุปข้อมูลทั้งหมดเกี่ยวกับ Backend API ที่พัฒนาเสร็จแล้ว เพื่อให้ทีม Frontend นำไปเชื่อมต่อและเรียกใช้งานได้อย่างถูกต้องครับ

---

## 🚀 ข้อมูลเบื้องต้น (Tech Stack)
- **Base URL:** `http://localhost:3000`
- **Database:** ใช้ไฟล์ `.json` ในโฟลเดอร์ `data/` เป็นที่เก็บข้อมูล (Local Storage จำลอง)
- **Real-time:** รองรับ WebSocket ผ่าน `socket.io`
- **CORS:** เปิดใช้งานแล้ว สามารถยิง API มาจาก Port อื่น (เช่น React/Vue) ได้เลยโดยไม่ติด Error CORS

## 🛠️ วิธีเปิด Server (สำหรับตอนพัฒนา)
ให้เปิด Terminal แล้วเข้าไปในโฟลเดอร์ `back` จากนั้นรันคำสั่ง:
```bash
npm run dev
```
*(ระบบจะใช้ `nodemon` หากคุณเข้าไปแก้โค้ดฝั่ง Backend เซิร์ฟเวอร์จะรีสตาร์ทให้เองอัตโนมัติ)*

---

## 📡 สรุปเส้นทาง API ทั้งหมด (Endpoints)

> **💡 Note:** API ทุกเส้น (ยกเว้นเรื่องอัปโหลดสลิป) รองรับข้อมูลทั้งแบบ **JSON (`application/json`)** และ **Form-Data (`multipart/form-data`)** ทำให้ทดสอบง่ายมาก

### 1. ระบบผู้ใช้งาน (Users)

| Method | URL | คำอธิบาย | ข้อมูลที่ต้องส่ง (Body) |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/users/register` | สมัครสมาชิก | `name`, `email`, `password`, `phone` |
| **POST** | `/api/users/login` | เข้าสู่ระบบ | `email`, `password` |

*ตัวอย่างการตอบกลับเมื่อ Login สำเร็จ:*
```json
{
  "message": "Login successful",
  "user": {
    "id": "a07bca3b-1917-4a96-9ac9-b3bbe206bd30",
    "name": "ทดสอบ",
    "email": "test@test.com",
    "phone": "0812345678",
    "role": "MEMBER"
  }
}
```
*(ให้นำค่า `id` จาก JSON ก้อนนี้ ไปใช้เป็น `userId` ในการจัดการตะกร้าสินค้าและสั่งซื้อครับ)*

### 2. ระบบสินค้า (Products)

| Method | URL | คำอธิบาย | Parameters (Query) |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/products` | ดึงรายการสินค้าทั้งหมด | `?category=...` (กรองตามหมวด), `?search=...` (ค้นหาชื่อ) |
| **GET** | `/api/products/:id` | ดึงข้อมูลสินค้าตาม ID เฉพาะเจาะจง | ไม่มี |

*(ในระบบมีข้อมูลสินค้า Mock-up เตรียมไว้ให้แล้ว เช่น `p1` (ช่อสำเร็จรูป), `p2` (ช่อ Custom), `p3` (ตุ๊กตาหมี))*

### 3. ระบบตะกร้าสินค้า (Cart)

> **คำแนะนำ:** เปลี่ยนคำว่า `:userId` ใน URL ด้านล่างเป็นรหัส `id` ของผู้ใช้ที่ล็อกอินอยู่

| Method | URL | คำอธิบาย | ข้อมูลที่ต้องส่ง (Body) |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/cart/:userId` | ดูของในตะกร้า | ไม่มี |
| **POST** | `/api/cart/:userId/add` | เพิ่มสินค้าลงตะกร้า | `productId`, `quantity`, `customOptions` (ถ้าเป็นช่อ Custom) |
| **PUT** | `/api/cart/:userId/update/:cartItemId`| แก้ไขจำนวนสินค้า | `quantity` |
| **DELETE** | `/api/cart/:userId/remove/:cartItemId`| ลบสินค้าออกจากตะกร้า | ไม่มี |

*ตัวอย่างการส่งข้อมูลช่อแบบ Custom (ใส่ `customOptions` เป็น Array หรือ Object ก็ได้):*
```json
{
    "productId": "p2",
    "quantity": 1,
    "customOptions": { "size": "L", "flower1": "กุหลาบแดง" }
}
```

### 4. ระบบสั่งซื้อและการชำระเงิน (Orders)

> ⚠️ **สำคัญ:** เส้น Checkout **ต้องส่งข้อมูลแบบ Form-Data เท่านั้น** เพราะมีการแนบไฟล์รูปภาพสลิปโอนเงินเข้ามาด้วย

| Method | URL | คำอธิบาย | ข้อมูลที่ต้องส่ง (Body) |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/orders/checkout` | สั่งซื้อสินค้า | `userId`, `cartItems`, `buyerInfo`, `recipientInfo`, `cardMessage`, `paymentMethod`, `paymentTime`, `totalAmount`, `paymentSlip` (แนบเป็นไฟล์) |
| **GET** | `/api/orders/user/:userId`| ดูประวัติคำสั่งซื้อของตนเอง | ไม่มี |
| **GET** | `/api/orders/:orderId` | ดูรายละเอียดคำสั่งซื้อ (บิล) | ไม่มี |

*(ไฟล์สลิปที่ถูกอัปโหลด จะไปเซฟอยู่ในโฟลเดอร์ `back/uploads/` และระบบจะคืนค่า URL กลับมาเป็น `/uploads/ชื่อไฟล์.jpg` ซึ่ง Frontend สามารถเอามาใส่ tag `<img src="http://localhost:3000/uploads/ชื่อไฟล์.jpg">` แสดงผลได้เลย)*

---

## 🔌 ระบบ Real-time (WebSocket)

ระบบนี้มี `socket.io` ติดตั้งไว้ให้แล้ว เพื่อใช้สร้างประสบการณ์แบบ Real-time ให้ผู้ใช้

**วิธีเชื่อมต่อจากหน้าเว็บ (ตัวอย่างโค้ด):**
```javascript
// 1. ติดตั้ง socket.io-client ฝั่งหน้าเว็บก่อน
// npm install socket.io-client

import { io } from "socket.io-client";

// 2. สั่งเชื่อมต่อ
const socket = io("http://localhost:3000");

// 3. เมื่อ User ล็อกอินสำเร็จ ให้ส่งคำสั่งขอเข้าห้องของตัวเอง
// เพื่อรับการแจ้งเตือนเรื่องตะกร้า/ออเดอร์ เฉพาะของตัวเอง
socket.emit('joinUserRoom', 'ใส่-userId-ของคนที่ล็อกอินตรงนี้');

// 4. ดักฟัง Event ตะกร้าสินค้าอัปเดต (เช่น เพื่อเปลี่ยนตัวเลขบนไอคอนตะกร้าบน Header)
socket.on('cartUpdated', (latestCartData) => {
    console.log("ตะกร้าอัปเดตแล้ว ข้อมูลใหม่คือ:", latestCartData);
    // ทำการอัปเดต State ตะกร้าในระบบ Frontend
});

// 5. ดักฟัง Event เมื่อมีคำสั่งซื้อใหม่เกิดขึ้น
socket.on('orderCreated', (newOrderData) => {
    console.log("สั่งซื้อสำเร็จ ออเดอร์ใหม่คือ:", newOrderData);
    // สั่ง Redirect หน้าจอไปที่หน้า "ขอบคุณที่สั่งซื้อ" หรือหน้ารายละเอียดออเดอร์
});
```

---

**หมายเหตุ:** 
ระบบฐานข้อมูลทั้งหมดถูกจำลองด้วยไฟล์นามสกุล `.json` ในโฟลเดอร์ `data/` หากเกิดปัญหาข้อมูลพัง หรือซ้ำซ้อนระหว่างการทดสอบพัฒนา คุณสามารถเข้าไปเปิดไฟล์ JSON แล้วลบก้อนข้อมูลที่ผิดปกติทิ้ง หรือจัดรูปมันใหม่ได้โดยตรงเลยครับ
