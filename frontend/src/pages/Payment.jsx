import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import api from '../utils/api';
import './Payment.scss';

const Payment = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReservation();
  }, [reservationId]);

  const fetchReservation = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reservations/${reservationId}`);
      setReservation(response.data);
    } catch (err) {
      setError('예약 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!reservation) return;

    try {
      setProcessing(true);
      
      // Initialize Toss Payments
      const tossClientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
      console.log('Toss Client Key:', tossClientKey);
      
      const tossPayments = await loadTossPayments(tossClientKey);

      const orderId = `ORDER_${Date.now()}_${reservationId}`;
      const orderName = `${reservation.hotelId?.name || '호텔'} - ${reservation.roomId?.name || '객실'}`;

      // Request payment
      await tossPayments.requestPayment('카드', {
        amount: reservation.totalPrice,
        orderId,
        orderName,
        customerName: reservation.userId?.name || '고객',
        successUrl: `${window.location.origin}/payment/success?reservationId=${reservationId}`,
        failUrl: `${window.location.origin}/payment/fail?reservationId=${reservationId}`,
      });

    } catch (err) {
      console.error('Payment error:', err);
      setError('결제 요청에 실패했습니다.');
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('예약을 취소하시겠습니까?')) return;

    try {
      await api.put(`/reservations/${reservationId}/cancel`);
      alert('예약이 취소되었습니다.');
      navigate('/mypage');
    } catch (err) {
      alert('예약 취소에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>결제 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="error-container">
        <p>{error || '예약 정보를 찾을 수 없습니다.'}</p>
        <button onClick={() => navigate('/hotels')} className="btn-back">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const checkIn = new Date(reservation.checkIn);
  const checkOut = new Date(reservation.checkOut);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  return (
    <div className="payment-page">
      <div className="container">
        <h1>결제하기</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="payment-content">
          {/* Left: Payment Info */}
          <div className="payment-info">
            <section className="info-section">
              <h2>예약 정보</h2>
              <div className="info-card">
                <div className="hotel-info">
                  <img 
                    src={reservation.hotelId?.images?.[0]?.url || '/placeholder-hotel.jpg'} 
                    alt={reservation.hotelId?.name} 
                  />
                  <div>
                    <h3>{reservation.hotelId?.name}</h3>
                    <p className="location">📍 {reservation.hotelId?.location?.city}</p>
                    <p className="room-name">{reservation.roomId?.name}</p>
                  </div>
                </div>

                <div className="reservation-details">
                  <div className="detail-row">
                    <span className="label">체크인</span>
                    <span className="value">
                      {checkIn.toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">체크아웃</span>
                    <span className="value">
                      {checkOut.toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">숙박 기간</span>
                    <span className="value">{nights}박</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">투숙 인원</span>
                    <span className="value">{reservation.guests}명</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="info-section">
              <h2>결제 수단</h2>
              <div className="payment-method">
                <div className="method-option selected">
                  <input type="radio" id="card" name="payment" checked readOnly />
                  <label htmlFor="card">
                    <span className="icon">💳</span>
                    <span>신용/체크카드</span>
                  </label>
                </div>
              </div>
              <p className="payment-notice">
                * Toss Payments 안전 결제 시스템을 이용합니다.
              </p>
            </section>

            <section className="info-section">
              <h2>환불 규정</h2>
              <div className="refund-policy">
                <ul>
                  <li>체크인 7일 전까지: 100% 환불</li>
                  <li>체크인 3일 전까지: 50% 환불</li>
                  <li>체크인 1일 전: 환불 불가</li>
                  <li>노쇼(No-show): 환불 불가</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Right: Price Summary */}
          <div className="payment-summary">
            <h2>결제 금액</h2>

            <div className="summary-details">
              <div className="summary-row">
                <span>객실 요금</span>
                <span>{reservation.roomId?.price?.toLocaleString()}원 x {nights}박</span>
              </div>

              <div className="summary-row">
                <span>소계</span>
                <span>{(reservation.roomId?.price * nights).toLocaleString()}원</span>
              </div>

              {reservation.usedPoints > 0 && (
                <div className="summary-row discount">
                  <span>포인트 사용</span>
                  <span>-{reservation.usedPoints.toLocaleString()}원</span>
                </div>
              )}

              {reservation.couponCode && (
                <div className="summary-row discount">
                  <span>쿠폰 할인</span>
                  <span>-{reservation.couponDiscount?.toLocaleString()}원</span>
                </div>
              )}

              <div className="divider"></div>

              <div className="summary-row total">
                <span>총 결제 금액</span>
                <span>{reservation.totalPrice.toLocaleString()}원</span>
              </div>

              <div className="points-info">
                <p>💰 결제 시 {Math.floor(reservation.totalPrice * 0.01).toLocaleString()}P 적립</p>
              </div>
            </div>

            <button 
              className="btn-payment"
              onClick={handlePayment}
              disabled={processing || reservation.status !== 'pending'}
            >
              {processing ? '처리 중...' : 
               reservation.status === 'confirmed' ? '결제 완료' :
               `${reservation.totalPrice.toLocaleString()}원 결제하기`}
            </button>

            {reservation.status === 'pending' && (
              <button 
                className="btn-cancel"
                onClick={handleCancel}
                disabled={processing}
              >
                예약 취소
              </button>
            )}

            <div className="secure-notice">
              <p>🔒 안전한 결제가 보장됩니다</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
