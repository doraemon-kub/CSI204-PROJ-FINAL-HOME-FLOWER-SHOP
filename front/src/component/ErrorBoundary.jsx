import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 20px',
          gap: '12px'
        }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '2rem', color: 'var(--primary, #b76e79)' }}></i>
          <h2 style={{ margin: 0 }}>เกิดข้อผิดพลาดบางอย่าง</h2>
          <p style={{ color: '#888', maxWidth: '400px' }}>
            ขออภัยในความไม่สะดวก กรุณาลองใหม่อีกครั้ง หากยังพบปัญหากรุณาติดต่อทีมงาน
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              this.handleReset();
              window.location.hash = '#home';
              window.location.reload();
            }}
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
