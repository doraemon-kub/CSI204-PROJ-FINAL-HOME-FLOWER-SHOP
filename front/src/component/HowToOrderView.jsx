import React from 'react';

const STEPS = [
  {
    number: 1,
    title: 'เลือกสินค้า',
    icon: 'fa-solid fa-clipboard-list',
    description: [
      'เข้าชมสินค้าภายในเว็บไซต์ของเรา เลือกดูสินค้าที่สนใจ ไม่ว่าจะเป็นช่อดอกไม้แห้งสำเร็จรูป ดอกไม้ประดิษฐ์ หรือของขวัญ พร้อมดูรายละเอียดสินค้า ราคา และตัวเลือกต่างๆ',
      'เมื่อเจอสินค้าที่ต้องการแล้ว กดปุ่ม "หยิบใส่ตะกร้า" เพื่อเพิ่มสินค้าลงในตะกร้า สามารถเลือกสินค้าได้หลายชิ้นตามต้องการ'
    ]
  },
  {
    number: 2,
    title: 'กรอกรายละเอียดในใบสั่งซื้อ',
    icon: 'fa-solid fa-file-pen',
    description: [
      'ตรวจสอบรายการสินค้าในตะกร้า ปรับจำนวนสินค้าที่ต้องการ',
      'กดปุ่ม "สั่งซื้อสินค้า" เพื่อเข้าสู่ขั้นตอนชำระเงิน จากนั้นกรอกรายละเอียดผู้รับ ได้แก่ ชื่อผู้รับ เบอร์โทรผู้รับ และที่อยู่จัดส่ง',
      'หากต้องการระบุข้อความหรือคำอวยพร สามารถระบุได้ในช่องหมายเหตุเพิ่มเติม'
    ]
  },
  {
    number: 3,
    title: 'ชำระเงิน',
    icon: 'fa-regular fa-credit-card',
    description: [
      'เลือกช่องทางชำระเงิน ได้แก่ โอนผ่านธนาคาร (Bank Transfer), พร้อมเพย์ (PromptPay) หรือเก็บเงินปลายทาง',
      'หลังจากเลือกช่องทางเรียบร้อย กดยืนยันการสั่งซื้อ แล้วรอทางร้านตรวจสอบยอดชำระเงิน'
    ]
  },
  {
    number: 4,
    title: 'สินค้าพร้อมจัดส่ง',
    icon: 'fa-solid fa-circle-check',
    description: [
      'หลังจากทางร้านตรวจสอบยอดชำระเรียบร้อยแล้ว เราจะเริ่มจัดเตรียมสินค้า บรรจุหีบห่ออย่างพิถีพิถัน เพื่อป้องกันความเสียหายระหว่างการขนส่ง',
      'ทางร้านจัดส่งพัสดุผ่านไปรษณีย์ EMS ทั่วประเทศ ค่าจัดส่งเหมาจ่าย 100 บาท โดยทั่วไปใช้เวลาเดินทาง 2-4 วันทำการ',
      'สามารถติดตามสถานะออเดอร์ได้ตลอดเวลาผ่านเมนู "ออเดอร์ของฉัน" ภายในเว็บไซต์'
    ]
  }
];

export default function HowToOrderView() {
  return (
    <>
      <style>{`
        /* ============= Hero Section ============= */
        .hto-hero {
          position: relative;
          min-height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(132,111,91,0.55) 0%, rgba(183,155,125,0.4) 40%, rgba(230,216,195,0.35) 100%),
            url('https://images.unsplash.com/photo-1487530811176-3780de880c2d?q=80&w=1600&auto=format&fit=crop');
          background-size: cover;
          background-position: center 30%;
        }
        .hto-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(245,245,240,0.15) 0%, rgba(102,83,66,0.35) 100%);
          z-index: 1;
        }
        .hto-hero-inner {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          animation: htoFadeIn 0.8s ease;
        }
        @keyframes htoFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hto-hero-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          backdrop-filter: blur(10px);
          border: 1.5px solid rgba(255,255,255,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: #fff;
        }
        .hto-hero h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
          text-shadow: 0 2px 16px rgba(0,0,0,0.12);
          letter-spacing: 0.5px;
        }

        /* ============= Steps Section ============= */
        .hto-steps-section {
          background: #fff;
          padding: 60px 0 50px;
        }
        .hto-steps-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }
        .hto-step {
          display: flex;
          align-items: flex-start;
          gap: 40px;
          animation: htoStepIn 0.6s ease both;
        }
        @keyframes htoStepIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hto-step:nth-child(even) {
          flex-direction: row-reverse;
        }

        /* Illustration card */
        .hto-step-illust {
          flex: 0 0 280px;
          height: 220px;
          background: linear-gradient(135deg, #f5f0ea 0%, #ede6dc 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .hto-step-illust-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .hto-step-illust i {
          font-size: 4.5rem;
          color: #c4b5a4;
          opacity: 0.7;
          transition: all 0.3s ease;
        }
        .hto-step:hover .hto-step-illust i {
          opacity: 1;
          color: #846F5B;
          transform: scale(1.08);
        }

        /* Text content */
        .hto-step-content {
          flex: 1;
          padding-top: 8px;
        }
        .hto-step-number {
          font-size: 0.8rem;
          font-weight: 600;
          color: #846F5B;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
          opacity: 0.7;
        }
        .hto-step-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--primary-dark, #6b5a49);
          margin: 0 0 14px;
          position: relative;
          display: inline-block;
          padding-bottom: 10px;
        }
        .hto-step-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 2px;
          background: var(--primary, #846F5B);
          border-radius: 2px;
        }
        .hto-step-desc {
          margin: 0;
          font-size: 0.9rem;
          color: #6b6b6b;
          line-height: 1.8;
        }
        .hto-step-desc + .hto-step-desc {
          margin-top: 10px;
        }

        /* ============= Bottom CTA ============= */
        .hto-bottom-section {
          background: linear-gradient(135deg, #c4b5a4 0%, #b5a48e 50%, #c4b5a4 100%);
          padding: 40px 24px;
          text-align: center;
        }
        .hto-bottom-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px;
        }
        .hto-bottom-subtitle {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.85);
          margin: 0;
        }

        /* ============= Responsive ============= */
        @media (max-width: 768px) {
          .hto-hero { min-height: 180px; }
          .hto-hero h1 { font-size: 1.6rem; }
          .hto-hero-icon { width: 64px; height: 64px; font-size: 1.6rem; }

          .hto-step,
          .hto-step:nth-child(even) {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 20px;
          }
          .hto-step-illust {
            flex: none;
            width: 100%;
            max-width: 320px;
            height: 180px;
          }
          .hto-step-title::after {
            left: 50%;
            transform: translateX(-50%);
          }
          .hto-steps-container { gap: 36px; }
        }
      `}</style>

      {/* Hero */}
      <header className="hto-hero">
        <div className="hto-hero-inner">
          <div className="hto-hero-icon">
            <i className="fa-solid fa-basket-shopping"></i>
          </div>
          <h1>วิธีการสั่งซื้อ</h1>
        </div>
      </header>

      {/* Steps */}
      <section className="hto-steps-section">
        <div className="hto-steps-container">
          {STEPS.map((step, idx) => (
            <div
              key={step.number}
              className="hto-step"
              style={{ animationDelay: `${idx * 0.12}s` }}
            >
              <div className="hto-step-illust">
                <div className="hto-step-illust-inner">
                  <i className={step.icon}></i>
                </div>
              </div>
              <div className="hto-step-content">
                <div className="hto-step-number">ขั้นตอนที่ {step.number}</div>
                <h3 className="hto-step-title">{step.title}</h3>
                {step.description.map((desc, i) => (
                  <p key={i} className="hto-step-desc">{desc}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
