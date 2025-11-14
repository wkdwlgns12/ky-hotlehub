import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.scss';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          🏨 HotelHub
        </Link>

        <nav className="nav">
          <Link to="/hotels" className="nav-link">호텔 검색</Link>
          
          {isAuthenticated ? (
            <>
              {user?.role === 'business' && (
                <Link to="/business/dashboard" className="nav-link">사업자 대시보드</Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="nav-link">관리자</Link>
              )}
              <Link to="/mypage" className="nav-link">마이페이지</Link>
              <button onClick={handleLogout} className="btn-logout">로그아웃</button>
              <div className="user-info">
                <span>{user?.name}님</span>
                {user?.points > 0 && (
                  <span className="points">💰 {user.points.toLocaleString()}P</span>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">로그인</Link>
              <Link to="/register" className="btn-register">회원가입</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
