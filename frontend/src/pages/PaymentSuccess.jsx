import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentSuccess.scss';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('reservationId');

  useEffect(() => {
    // Optional: Confirm payment on backend
    // api.post('/payments/confirm', { reservationId });
  }, []);

  return (
    <div className="payment-result-page success">
      <div className="container">
        <div className="result-card">
          <div className="icon success-icon">✓</div>
          <h1>결제가 완료되었습니다!</h1>
          <p className="message">
            예약이 정상적으로 완료되었습니다.<br />
            예약 내역은 마이페이지에서 확인하실 수 있습니다.
          </p>

          <div className="button-group">
            <button 
              className="btn-primary"
              onClick={() => navigate('/mypage')}
            >
              예약 내역 보기
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/hotels')}
            >
              호텔 더보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
