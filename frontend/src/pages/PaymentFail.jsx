import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentSuccess.scss';

const PaymentFail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('reservationId');

  return (
    <div className="payment-result-page fail">
      <div className="container">
        <div className="result-card">
          <div className="icon fail-icon">✕</div>
          <h1>결제에 실패했습니다</h1>
          <p className="message">
            결제 처리 중 문제가 발생했습니다.<br />
            다시 시도해 주시기 바랍니다.
          </p>

          <div className="button-group">
            <button 
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
