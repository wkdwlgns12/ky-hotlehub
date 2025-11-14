import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './CompleteProfile.scss';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Update user profile
      await api.put('/users/me', formData);
      
      // Update localStorage and context
      const user = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      updateUser(formData);

      // Redirect to home with full page reload to ensure auth state is updated
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.message || '프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complete-profile-page">
      <div className="modal-overlay">
        <div className="profile-modal">
          <div className="modal-header">
            <h2>프로필 완성하기</h2>
            <p>서비스를 이용하시려면 추가 정보를 입력해주세요</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
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
              <label htmlFor="phone">전화번호 *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="010-1234-5678"
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '저장 중...' : '완료'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
