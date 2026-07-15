import React, { useState } from 'react';

const TERMS_SECTIONS = [
  {
    id: 'shipping',
    title: 'การจัดส่งสินค้า',
    content: (
      <>
        <p>
          <i className="fa-solid fa-circle-dot" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
          การจัดส่งสินค้า
        </p>
        <p style={{ marginTop: '4px', marginBottom: '12px' }}>
          ทางร้านจัดส่งดอกไม้แห้งและสินค้าทุกชิ้นผ่านไปรษณีย์ EMS เพื่อให้สินค้าถึงมือลูกค้าอย่างรวดเร็วและปลอดภัย
          โดยคิดค่าจัดส่งเหมาจ่าย 100 บาทต่อออเดอร์
        </p>
        <p style={{ marginBottom: '12px' }}>
          เราจะบรรจุสินค้าอย่างพิถีพิถัน เพื่อป้องกันความเสียหายระหว่างการขนส่ง และหลังจากจัดส่งเรียบร้อยแล้ว
          ทางร้านจะแจ้งเลขติดตามพัสดุ (Tracking Number) ผ่านช่องทางติดตามสถานะออเดอร์ ให้ลูกค้าสามารถตรวจสอบสถานะการจัดส่งได้ทันที
        </p>
        <p>
          <i className="fa-solid fa-seedling" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
          ขอบคุณที่ไว้วางใจให้ดอกไม้แห้งของเราเป็นส่วนหนึ่งในช่วงเวลาพิเศษของคุณ
        </p>
      </>
    )
  },
  {
    id: 'conditions',
    title: 'เงื่อนไขการสั่งซื้อสินค้า',
    content: (
      <>
        <ul style={{ paddingLeft: '18px', margin: 0, lineHeight: 1.9 }}>
          <li>กรุณาตรวจสอบข้อมูลผู้สั่งซื้อและผู้รับให้ถูกต้องครบถ้วนก่อนยืนยันการสั่งซื้อ</li>
          <li>สินค้าจะเริ่มดำเนินการจัดเตรียมหลังจากทางร้านตรวจสอบยอดชำระเงินเรียบร้อยแล้ว</li>
          <li>ระยะเวลาจัดส่งโดยประมาณ 2-4 วันทำการ ไม่รวมวันหยุดนักขัตฤกษ์</li>
          <li>สีสันและรูปทรงของดอกไม้แห้งแต่ละช่ออาจมีความแตกต่างเล็กน้อยจากภาพตัวอย่าง เนื่องจากเป็นงานทำมือ</li>
          <li>กรณีต้องการข้อความในการ์ดหรือคำขอพิเศษ กรุณาระบุในขั้นตอนชำระเงิน</li>
        </ul>
      </>
    )
  },
  {
    id: 'replacement',
    title: 'การทดแทนสินค้า',
    content: (
      <>
        <p style={{ marginBottom: '12px' }}>
          หากสินค้าที่สั่งหมดสต๊อกในช่วงเวลาที่จัดส่ง ทางร้านขอสงวนสิทธิ์ในการทดแทนด้วยสินค้าที่มีมูลค่าใกล้เคียงกัน
          หรือมีโทนสี/สไตล์ใกล้เคียงกับที่ลูกค้าเลือกไว้ โดยจะแจ้งให้ลูกค้าทราบล่วงหน้าก่อนดำเนินการจัดส่งทุกครั้ง
        </p>
        <p>
          หากลูกค้าไม่ต้องการให้ทดแทนสินค้า สามารถแจ้งความประสงค์ขอยกเลิกหรือคืนเงินเต็มจำนวนสำหรับรายการนั้นได้
        </p>
      </>
    )
  },
  {
    id: 'refund',
    title: 'นโยบายการคืนเงิน',
    content: (
      <>
        <p style={{ marginBottom: '12px' }}>
          ลูกค้าสามารถขอคืนเงินได้ภายใน 3 วัน หลังจากได้รับสินค้า ในกรณีที่สินค้าชำรุดเสียหายจากการขนส่ง
          หรือได้รับสินค้าไม่ตรงตามที่สั่งซื้อ โดยแนบภาพถ่ายสินค้าเป็นหลักฐานประกอบการพิจารณา
        </p>
        <p>
          ทางร้านจะดำเนินการตรวจสอบและคืนเงินภายใน 5-7 วันทำการ ผ่านช่องทางเดียวกับที่ลูกค้าใช้ชำระเงิน
        </p>
      </>
    )
  }
];

export default function OrderTermsView({ onViewChange }) {
  const [openSection, setOpenSection] = useState('shipping');

  const toggleSection = (id) => {
    setOpenSection((prev) => (prev === id ? '' : id));
  };

  return (
    <div className="wireframe-view container" id="orderTermsView">
      <div className="wireframe-title-container">
        <span className="wireframe-header-text">เงื่อนไขการสั่งซื้อสินค้า</span>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 0 60px' }}>
        {TERMS_SECTIONS.map((section) => {
          const isOpen = openSection === section.id;
          return (
            <div
              key={section.id}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                marginBottom: '14px',
                overflow: 'hidden',
                background: '#fff'
              }}
            >
              <button
                onClick={() => toggleSection(section.id)}
                aria-expanded={isOpen}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: isOpen ? 'var(--light-bg)' : '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--primary-dark)',
                  textAlign: 'left'
                }}
              >
                <span>{section.title}</span>
                <i
                  className="fa-solid fa-chevron-down"
                  style={{
                    transition: 'transform 0.25s ease',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: 'var(--primary)'
                  }}
                ></i>
              </button>

              <div
                style={{
                  maxHeight: isOpen ? '600px' : '0px',
                  transition: 'max-height 0.3s ease',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    padding: '4px 20px 20px',
                    color: 'var(--text-dark)',
                    fontSize: '0.92rem',
                    lineHeight: 1.7
                  }}
                >
                  {section.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
