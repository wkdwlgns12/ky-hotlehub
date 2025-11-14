# 🏨 HotelHub - 호텔 예약 플랫폼

> MERN 스택 기반의 풀스택 호텔 예약 시스템 

## 📋 프로젝트 개요

HotelHub은 일반 사용자, 사업자, 관리자를 위한 종합 호텔 예약 플랫폼입니다. React와 Node.js를 기반으로 구축되었으며, MongoDB를 데이터베이스로 사용합니다.

## ✨ 주요 기능

### 👤 일반 사용자
- 🔐 회원가입 및 로그인 (이메일/카카오)
- 📝 카카오 로그인 시 프로필 자동 완성
- 🔍 호텔 검색 및 필터링 (지역, 가격, 평점, 편의시설)
- 🏨 호텔 상세 정보 조회 (객실, 리뷰, 카카오맵)
- 🎉 객실 할인 이벤트 표시 (원가 대비 할인율)
- 📅 실시간 예약 시스템
- 💳 Toss Payments 결제 연동
- 💰 포인트 적립 및 사용
- 🎫 쿠폰 적용
- ⭐ 리뷰 작성/수정/삭제 (사진 업로드, 500P 적립)
- 🚨 리뷰 신고 기능
- 📊 마이페이지 (예약 내역, 포인트 관리, 프로필 수정)
- 🗑️ 계정 삭제 기능

### 🏢 사업자
- 🏨 호텔 등록 및 관리
- 🛏️ 객실 관리 (등록, 수정, 삭제, 재고 관리)
- 🎉 객실 할인 이벤트 설정 (원가, 판매가, 자동 할인율 계산)
- 📈 예약 현황 조회
- 💵 매출 통계
- ⭐ 호텔 리뷰 관리 (삭제 권한)

### 👨‍💼 관리자
- 📊 전체 통계 대시보드 (총 회원자, 호텔, 예약, 매출)
- ✅ 사업자 승인 관리
- 🏨 호텔 승인/거부
- 🚨 신고된 리뷰 처리
- 💬 문의사항 관리 (FAQ, 고객센터)
- 🎟️ 쿠폰 생성 및 관리
- 👥 사용자 관리 (차단, 승인)

## 🛠️ 기술 스택

### Frontend
- **React 18.2.0** - UI 라이브러리
- **Vite 5.0.0** - 빌드 툴
- **React Router 6.20.0** - 라우팅
- **Axios 1.6.0** - HTTP 클라이언트
- **SCSS/Sass 1.69.5** - 스타일링
- **Toss Payments SDK** - 결제 연동

### Backend
- **Node.js** - 런타임 환경
- **Express 4.18.2** - 웹 프레임워크
- **MongoDB + Mongoose 8.0.0** - 데이터베이스
- **JWT (jsonwebtoken 9.0.2)** - 인증
- **bcryptjs 2.4.3** - 비밀번호 암호화
- **Multer** - 파일 업로드
- **Helmet 7.1.0** - 보안
- **CORS 2.8.5** - CORS 처리
- **Morgan 1.10.0** - 로깅

### 외부 API
- **Toss Payments API** - 결제 처리
- **Kakao Login API** - 소셜 로그인 (OAuth 2.0)
- **Kakao Map API** - 지도 표시 (주소 검색, Geocoding)
- **Kakao Map Link** - 카카오맵 외부 링크 연동

## 📁 프로젝트 구조

```
HotelTeamProject/
├── backend/                 # Express 백엔드 서버
│   ├── server.js           # 서버 진입점
│   ├── .env                # 환경 변수
│   ├── package.json
│   ├── src/
│   │   ├── models/         # Mongoose 모델 (6개)
│   │   │   ├── User.js
│   │   │   ├── Hotel.js
│   │   │   ├── Room.js
│   │   │   ├── Reservation.js
│   │   │   ├── Review.js
│   │   │   └── Coupon.js
│   │   ├── routes/         # API 라우트 (8개)
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── hotels.js
│   │   │   ├── reservations.js
│   │   │   ├── payments.js
│   │   │   ├── reviews.js
│   │   │   ├── admin.js
│   │   │   └── upload.js
│   │   ├── middleware/     # 미들웨어
│   │   │   ├── auth.js     # JWT 인증
│   │   │   └── upload.js   # Multer 설정
│   │   └── utils/
│   │       └── jwt.js      # JWT 유틸리티
│   └── uploads/            # 업로드된 파일
│
└── frontend/               # React 프론트엔드
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env
    ├── public/
    └── src/
        ├── main.jsx        # React 진입점
        ├── App.jsx         # 메인 앱 컴포넌트
        ├── App.scss
        ├── assets/
        │   └── css/
        │       └── global.scss
        ├── components/     # 재사용 가능한 컴포넌트
        │   ├── Header.jsx
        │   ├── HotelCard.jsx
        │   ├── SearchBar.jsx
        │   └── common/
        │       └── Footer.jsx         # 푸터 (SNS, 노션 링크)
        ├── context/
        │   └── AuthContext.jsx  # 인증 상태 관리
        ├── pages/          # 페이지 컴포넌트 (20개)
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── KakaoCallback.jsx      # 카카오 로그인 콜백
        │   ├── CompleteProfile.jsx    # 프로필 완성 (카카오)
        │   ├── HotelList.jsx
        │   ├── HotelDetail.jsx
        │   ├── Reservation.jsx
        │   ├── Payment.jsx
        │   ├── PaymentSuccess.jsx
        │   ├── PaymentFail.jsx
        │   ├── MyPage.jsx
        │   ├── ReviewWrite.jsx
        │   ├── BusinessDashboard.jsx
        │   ├── BusinessApprovalPending.jsx  # 사업자 승인 대기
        │   ├── AddHotel.jsx           # 호텔 등록
        │   ├── AddRoom.jsx            # 객실 등록 (할인 설정)
        │   ├── AdminDashboard.jsx
        │   ├── FAQ.jsx                # 자주 묻는 질문
        │   ├── Support.jsx            # 고객센터
        │   ├── Terms.jsx              # 이용약관
        │   └── Privacy.jsx            # 개인정보처리방침
        ├── router/
        │   └── index.js
        └── utils/
            └── api.js      # Axios 인스턴스
```

## 🚀 시작하기

### 사전 요구사항
- Node.js 18.x 이상
- MongoDB 6.x 이상
- npm 또는 yarn

### 설치 및 실행

#### 1. Backend 실행
```bash
cd backend
npm install
npm run dev
```
서버가 http://localhost:3000 에서 실행됩니다.

#### 2. Frontend 실행
```bash
cd frontend
npm install
npm run dev
```
앱이 http://localhost:5173 에서 실행됩니다.

## 📡 API 엔드포인트

### 인증 (Auth)
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인
- `GET /auth/kakao` - 카카오 로그인
- `POST /auth/logout` - 로그아웃

### 사용자 (Users)
- `GET /users/me` - 내 정보 조회
- `PUT /users/me` - 내 정보 수정
- `GET /users/me/points` - 포인트 내역 조회

### 호텔 (Hotels)
- `GET /hotels` - 호텔 목록 조회
- `GET /hotels/:id` - 호텔 상세 조회
- `POST /hotels` - 호텔 등록 (사업자)
- `GET /hotels/:id/rooms` - 객실 목록 조회
- `POST /hotels/:id/rooms` - 객실 등록 (사업자)

### 예약 (Reservations)
- `GET /reservations` - 내 예약 목록
- `GET /reservations/:id` - 예약 상세 조회
- `POST /reservations` - 예약 생성
- `PUT /reservations/:id/cancel` - 예약 취소

### 결제 (Payments)
- `POST /payments/confirm` - 결제 승인
- `POST /payments/cancel` - 결제 취소
- `POST /payments/webhook` - 결제 웹훅

### 리뷰 (Reviews)
- `GET /reviews` - 리뷰 목록 조회
- `POST /reviews` - 리뷰 작성 (500P 적립)
- `PUT /reviews/:id` - 리뷰 수정
- `DELETE /reviews/:id` - 리뷰 삭제
- `POST /reviews/:id/report` - 리뷰 신고

### 관리자 (Admin)
- `GET /admin/stats` - 통계 조회
- `GET /admin/users` - 사용자 목록
- `PUT /admin/users/:id/approve` - 사업자 승인
- `PUT /admin/users/:id/block` - 사용자 차단
- `GET /admin/hotels` - 호텔 목록
- `PUT /admin/hotels/:id/status` - 호텔 상태 변경
- `GET /admin/coupons` - 쿠폰 목록
- `POST /admin/coupons` - 쿠폰 생성

### 고객지원 (Support)
- `POST /support/inquiries` - 문의 등록
- `GET /support/inquiries` - 문의 목록 (관리자)
- `PUT /support/inquiries/:id` - 문의 답변 (관리자)
- `GET /support/faq` - FAQ 목록

### 파일 업로드 (Upload)
- `POST /upload/single` - 단일 파일 업로드
- `POST /upload/multiple` - 다중 파일 업로드 (최대 10개)

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: `#667eea` (보라색)
- **Secondary**: `#764ba2` (진한 보라색)
- **Success**: `#059669` (녹색)
- **Danger**: `#dc2626` (빨간색)
- **Warning**: `#f59e0b` (주황색)
- **Info**: `#667eea` (파란색)

### 그라디언트
```scss
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### 애니메이션
- `fadeIn` - 페이드 인
- `fadeInUp` - 아래에서 위로 페이드 인
- `fadeInDown` - 위에서 아래로 페이드 인
- `scaleIn` - 크기 애니메이션
- `spin` - 회전 (로딩)

## 🔐 보안

- JWT 토큰 기반 인증
- bcrypt 비밀번호 해싱
- Helmet.js 보안 헤더
- CORS 정책
- XSS 방지
- SQL Injection 방지 (NoSQL)
- Rate Limiting (예정)

## 📱 반응형 디자인

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

모든 페이지가 모바일 최적화되어 있습니다.

## 🧪 테스트

```bash
# Backend 테스트
cd backend
npm test

# Frontend 테스트
cd frontend
npm test
```

## 📦 빌드 및 배포

### Frontend 빌드
```bash
cd frontend
npm run build
```

빌드 파일은 `frontend/dist` 폴더에 생성됩니다.

### Backend 배포
```bash
cd backend
npm start
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 👥 개발자

- **Backend**: Express + MongoDB
- **Frontend**: React + Vite
- **Design**: SCSS + Gradient UI

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

📧 **Email**: happysun0142@gmail.com  
📱 **Phone**: 010-4694-1136  
📝 **Notion**: [프로젝트 문서](https://www.notion.so/3-2a9d0bd64ce9800e8d8bd98bd59b0c3e)

⭐ 이 프로젝트가 유용했다면 Star를 눌러주세요!