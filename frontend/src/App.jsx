import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/common/Footer'
import './App.scss'

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import HotelList from './pages/HotelList';
import HotelDetail from './pages/HotelDetail';
import Reservation from './pages/Reservation';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import MyPage from './pages/MyPage';
import ReviewWrite from './pages/ReviewWrite';
import BusinessDashboard from './pages/BusinessDashboard';
import BusinessApprovalPending from './pages/BusinessApprovalPending';
import AddHotel from './pages/AddHotel';
import AddRoom from './pages/AddRoom';
import EditRoom from './pages/EditRoom';
import AdminDashboard from './pages/AdminDashboard';
import FAQ from './pages/FAQ';
import Support from './pages/Support';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import KakaoCallback from './pages/KakaoCallback';
import CompleteProfile from './pages/CompleteProfile';
import CouponManagement from './pages/CouponManagement';

// Home component
const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      <h1>🏨 HotelHub</h1>
      <p>호텔 예약 플랫폼</p>
      <div className="home-links">
        <a href="/hotels" className="btn-primary">호텔 검색</a>
        {!isAuthenticated && (
          <a href="/login" className="btn-secondary">로그인</a>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<KakaoCallback />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/hotels" element={<HotelList />} />
            <Route path="/hotels/:id" element={<HotelDetail />} />
            <Route path="/reservation/:hotelId/:roomId" element={<Reservation />} />
            <Route path="/payment/:reservationId" element={<Payment />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/fail" element={<PaymentFail />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/review/write/:hotelId/:reservationId" element={<ReviewWrite />} />
            <Route path="/business/pending" element={<BusinessApprovalPending />} />
            <Route path="/business/dashboard" element={<BusinessDashboard />} />
            <Route path="/business/hotels/add" element={<AddHotel />} />
            <Route path="/business/hotels/:hotelId/rooms/add" element={<AddRoom />} />
            <Route path="/business/hotels/:hotelId/rooms/:roomId/edit" element={<EditRoom />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/coupons/manage" element={<CouponManagement />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/support" element={<Support />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
