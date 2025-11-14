import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './BusinessApprovalPending.scss';

const BusinessApprovalPending = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user || user.role !== 'business' || user.businessApproved) {
    navigate('/');
    return null;
  }

  return (
    <div className="approval-pending-page">
      <div className="container">
        <div className="pending-card">
          <div className="icon">⏳</div>
          <h1>사업자 승인 대기 중</h1>
          <p className="message">
            <strong>{user.businessName}</strong> 계정이 생성되었습니다.
          </p>
          <p className="description">
            관리자 승인 후 사업자 전용 기능을 사용하실 수 있습니다.
            <br />
            승인은 영업일 기준 1-2일 소요됩니다.
          </p>

          <div className="info-box">
            <h3>📋 제출하신 정보</h3>
            <div className="info-item">
              <span className="label">사업자명:</span>
              <span className="value">{user.businessName}</span>
            </div>
            <div className="info-item">
              <span className="label">이메일:</span>
              <span className="value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="label">연락처:</span>
              <span className="value">{user.phone || '미등록'}</span>
            </div>
          </div>

          <div className="next-steps">
            <h3>💡 다음 단계</h3>
            <ul>
              <li>관리자가 사업자 등록번호를 확인합니다</li>
              <li>승인 완료 시 이메일로 알림을 보내드립니다</li>
              <li>승인 후 호텔 등록 및 관리가 가능합니다</li>
            </ul>
          </div>

          <div className="actions">
            <button className="btn-secondary" onClick={() => navigate('/')}>
              홈으로
            </button>
            <button className="btn-danger" onClick={logout}>
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessApprovalPending;
