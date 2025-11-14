import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Footer.scss';

const Footer = () => {
  const { user } = useAuth();
  const isBusinessUser = user?.role === 'business' && user?.businessApproved;

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* 상단 섹션 */}
        <div className="footer-top">
          <div className="footer-section">
            <h3>HotelHub</h3>
            <p className="footer-description">
              최고의 숙박 경험을 제공하는 호텔 예약 플랫폼
            </p>
            <div className="social-links">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="https://www.notion.so/3-2a9d0bd64ce9800e8d8bd98bd59b0c3e?source=copy_link" target="_blank" rel="noopener noreferrer" aria-label="Notion">
                <span className="notion-icon">📝</span>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>서비스</h4>
            <ul>
              <li><Link to="/hotels">호텔 검색</Link></li>
              {isBusinessUser && (
                <li><Link to="/business/dashboard">사업자 대시보드</Link></li>
              )}
              {user && <li><Link to="/mypage">마이페이지</Link></li>}
            </ul>
          </div>

          <div className="footer-section">
            <h4>고객지원</h4>
            <ul>
              <li><Link to="/faq">자주 묻는 질문</Link></li>
              <li><Link to="/support">고객센터</Link></li>
              <li><Link to="/terms">이용약관</Link></li>
              <li><Link to="/privacy">개인정보처리방침</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>회사 정보</h4>
            <ul className="contact-info">
              <li>
                <i className="fas fa-user"></i>
                <span>대표: 최길동</span>
              </li>
              <li>
                <i className="fas fa-phone"></i>
                <span>전화: 1588-1234</span>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <span>이메일: contact@hotelhub.com</span>
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>남양주시 진접읍 경복대로 425</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 섹션 */}
        <div className="footer-bottom">
          <p>&copy; 2025 HotelHub. All rights reserved.</p>
          <p className="business-info">
            사업자등록번호: 123-45-67890 | 통신판매업신고: 2025-진접읍 경복대로 425-1234
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
