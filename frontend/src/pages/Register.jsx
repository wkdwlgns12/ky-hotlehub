import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.scss';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    accountType: 'user' // user or business
  });
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 추출
    let formattedPhone = '';

    if (value.length <= 3) {
      formattedPhone = value;
    } else if (value.length <= 7) {
      formattedPhone = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length <= 11) {
      formattedPhone = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
    } else {
      formattedPhone = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }

    setFormData({
      ...formData,
      phone: formattedPhone
    });
  };

  const handleBusinessChange = (e) => {
    setBusinessData({
      ...businessData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        role: formData.accountType
      };

      if (formData.accountType === 'business') {
        userData.businessName = businessData.businessName;
        userData.businessNumber = businessData.businessNumber;
      }

      await register(userData);
      
      // 사업자 계정이면 승인 대기 페이지로, 일반 사용자면 홈으로
      if (formData.accountType === 'business') {
        navigate('/business/pending');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>🏨 HotelHub</h1>
        <h2>회원가입</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="account-type">
            <label className={formData.accountType === 'user' ? 'active' : ''}>
              <input
                type="radio"
                name="accountType"
                value="user"
                checked={formData.accountType === 'user'}
                onChange={handleChange}
              />
              <span>👤 일반 사용자</span>
            </label>
            <label className={formData.accountType === 'business' ? 'active' : ''}>
              <input
                type="radio"
                name="accountType"
                value="business"
                checked={formData.accountType === 'business'}
                onChange={handleChange}
              />
              <span>🏢 사업자</span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일 *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호 *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="최소 6자 이상"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인 *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="비밀번호 재입력"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">이름 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="홍길동"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">전화번호</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="010-1234-5678"
              maxLength={13}
            />
          </div>

          {formData.accountType === 'business' && (
            <>
              <div className="business-section">
                <h3>사업자 정보</h3>
                <div className="form-group">
                  <label htmlFor="businessName">사업자명 *</label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={businessData.businessName}
                    onChange={handleBusinessChange}
                    required={formData.accountType === 'business'}
                    placeholder="호텔 ABC"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="businessNumber">사업자 등록번호 *</label>
                  <input
                    type="text"
                    id="businessNumber"
                    name="businessNumber"
                    value={businessData.businessNumber}
                    onChange={handleBusinessChange}
                    required={formData.accountType === 'business'}
                    placeholder="123-45-67890"
                  />
                </div>
              </div>

              <div className="info-box">
                <p>⚠️ 사업자 계정은 관리자 승인 후 사용 가능합니다.</p>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="links">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
