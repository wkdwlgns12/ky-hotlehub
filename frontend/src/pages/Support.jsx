import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Support.scss';

const Support = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    category: 'general',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'general', label: '일반 문의' },
    { value: 'reservation', label: '예약 관련' },
    { value: 'payment', label: '결제/환불' },
    { value: 'account', label: '계정 문의' },
    { value: 'business', label: '사업자 문의' },
    { value: 'technical', label: '기술 지원' },
    { value: 'other', label: '기타' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message) {
      setError('제목과 문의 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/support/inquiries', formData);
      setSuccess(true);
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        category: 'general',
        subject: '',
        message: ''
      });

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError('문의 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="support-page">
      <div className="support-container">
        <div className="support-header">
          <h1>고객센터</h1>
          <p>무엇을 도와드릴까요?</p>
        </div>

        <div className="support-content">
          {/* 빠른 도움말 */}
          <div className="quick-help">
            <h2>빠른 도움말</h2>
            <div className="help-cards">
              <a href="/faq" className="help-card">
                <div className="card-icon">❓</div>
                <h3>자주 묻는 질문</h3>
                <p>자주 묻는 질문과 답변을 확인하세요</p>
              </a>
              
              <div className="help-card">
                <div className="card-icon">📞</div>
                <h3>전화 상담</h3>
                <p>1588-1234</p>
                <span className="time">평일 09:00 - 18:00</span>
              </div>
              
              <div className="help-card">
                <div className="card-icon">✉️</div>
                <h3>이메일 문의</h3>
                <p>contact@hotelhub.com</p>
                <span className="time">24시간 접수 가능</span>
              </div>
            </div>
          </div>

          {/* 1:1 문의 폼 */}
          <div className="inquiry-section">
            <h2>1:1 문의하기</h2>
            <p className="section-desc">
              문의사항을 남겨주시면 빠른 시일 내에 답변 드리겠습니다.
            </p>

            {success && (
              <div className="success-message">
                <span className="icon">✓</span>
                문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.
              </div>
            )}

            {error && (
              <div className="error-message">
                <span className="icon">⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="inquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">이름 *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="홍길동"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">이메일 *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">문의 유형 *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="subject">제목 *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="문의 제목을 입력하세요"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">문의 내용 *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="문의하실 내용을 상세히 입력해주세요"
                  rows={8}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? '전송 중...' : '문의 등록'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
