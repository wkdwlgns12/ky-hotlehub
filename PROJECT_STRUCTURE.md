# 🏨 HotelHub 프로젝트 구조

## 📁 전체 구조

```
C:\HotelTeamProject/
├── README.md                          # 프로젝트 문서
│
├── backend/                           # Express 백엔드 (173 packages)
│   ├── server.js                      # ✅ 서버 진입점 (ES Module)
│   ├── package.json                   # ✅ 의존성 관리
│   ├── .env                           # ✅ 환경 변수
│   │
│   ├── scripts/                       # ✅ 유틸리티 스크립트
│   │   ├── createAdmin.js            # ✅ 관리자 계정 생성
│   │   ├── deleteOldAdmin.js         # ✅ 기존 관리자 삭제
│   │   ├── checkAdmin.js             # ✅ 관리자 정보 확인
│   │   ├── testLogin.js              # ✅ 로그인 테스트
│   │   └── createSampleHotels.js     # ✅ 샘플 호텔 10개 생성
│   │
│   ├── src/
│   │   ├── models/                    # ✅ Mongoose 모델 (6개)
│   │   │   ├── User.js               # ✅ 사용자 (일반/사업자/관리자, 소셜로그인)
│   │   │   ├── Hotel.js              # ✅ 호텔 (10개 샘플 데이터)
│   │   │   ├── Room.js               # ✅ 객실 (할인가, 원가, 할인율, 재고)
│   │   │   ├── Reservation.js        # ✅ 예약
│   │   │   ├── Review.js             # ✅ 리뷰 (신고 기능)
│   │   │   └── Coupon.js             # ✅ 쿠폰
│   │   │
│   │   ├── routes/                    # ✅ API 라우트 (9개)
│   │   │   ├── auth.js               # ✅ 회원가입/로그인/로그아웃/카카오
│   │   │   ├── users.js              # ✅ 사용자 정보/포인트/계정삭제
│   │   │   ├── hotels.js             # ✅ 호텔 CRUD/검색/필터/객실관리
│   │   │   ├── reservations.js       # ✅ 예약 생성/조회/취소
│   │   │   ├── payments.js           # ✅ Toss Payments 연동
│   │   │   ├── reviews.js            # ✅ 리뷰 작성/수정/삭제/신고
│   │   │   ├── admin.js              # ✅ 관리자 기능 (통계, 승인, 문의)
│   │   │   ├── support.js            # ✅ 고객지원 (FAQ, 문의사항)
│   │   │   └── upload.js             # ✅ 파일 업로드 (Multer)
│   │   │
│   │   ├── middleware/                # ✅ 미들웨어
│   │   │   ├── auth.js               # ✅ JWT 인증/권한 검사
│   │   │   └── upload.js             # ✅ Multer 설정 (5MB)
│   │   │
│   │   └── utils/
│   │       └── jwt.js                # ✅ JWT 토큰 생성
│   │
│   └── uploads/                       # ✅ 업로드된 파일 저장소
│
└── frontend/                          # React 프론트엔드 (329 packages)
    ├── index.html                     # ✅ HTML 진입점
    ├── vite.config.js                # ✅ Vite 설정
    ├── package.json                   # ✅ 의존성 관리
    ├── .env                           # ✅ 환경 변수
    │
    ├── public/                        # 정적 파일
    │   └── (아이콘 등)
    │
    └── src/
        ├── main.jsx                   # ✅ React 진입점
        ├── App.jsx                    # ✅ 메인 앱 컴포넌트 (라우팅)
        ├── App.scss                   # ✅ 글로벌 스타일 (보라색 그라디언트)
        │
        ├── assets/
        │   └── css/
        │       └── global.scss        # ✅ 전역 스타일 (애니메이션, 유틸리티)
        │
        ├── components/                # ✅ 재사용 컴포넌트 (4개)
        │   ├── Header.jsx            # ✅ 헤더 (네비게이션, 사용자 정보)
        │   ├── Header.scss           # ✅ 헤더 스타일 (그라디언트, hover 효과)
        │   ├── HotelCard.jsx         # ✅ 호텔 카드 (목록용)
        │   ├── HotelCard.scss        # ✅ 카드 스타일 (hover 애니메이션)
        │   ├── SearchBar.jsx         # ✅ 검색바 (15개 도시, 날짜, 가격, 1-5성급)
        │   ├── SearchBar.scss        # ✅ 검색바 스타일 (골드 버튼)
        │   └── common/
        │       ├── Footer.jsx        # ✅ 푸터 (SNS, 노션, 법적 정보)
        │       └── Footer.scss       # ✅ 푸터 스타일 (그라디언트 배경)
        │
        ├── context/
        │   └── AuthContext.jsx       # ✅ 인증 상태 관리 (로그인/로그아웃)
        │
        ├── hooks/
        │   └── useKakaoMap.js        # ✅ 카카오맵 SDK 로드 (Geocoding)
        │
        ├── pages/                     # ✅ 페이지 컴포넌트 (20개)
        │   ├── Login.jsx             # ✅ 로그인 (이메일/카카오)
        │   ├── Login.scss            # ✅ 로그인 스타일 (floating circles)
        │   ├── Register.jsx          # ✅ 회원가입 (일반/사업자)
        │   ├── Register.scss         # ✅ 회원가입 스타일
        │   ├── KakaoCallback.jsx     # ✅ 카카오 로그인 콜백
        │   ├── CompleteProfile.jsx   # ✅ 프로필 완성 모달
        │   ├── CompleteProfile.scss  # ✅ 프로필 완성 스타일
        │   ├── HotelList.jsx         # ✅ 호텔 목록 (10개 샘플)
        │   ├── HotelList.scss        # ✅ 목록 스타일 (그리드, 페이지네이션)
        │   ├── HotelDetail.jsx       # ✅ 호텔 상세 (객실, 리뷰)
        │   ├── HotelDetail.scss      # ✅ 상세 스타일
        │   ├── Reservation.jsx       # ✅ 예약 (날짜, 인원, 포인트, 쿠폰)
        │   ├── Reservation.scss      # ✅ 예약 스타일
        │   ├── Payment.jsx           # ✅ 결제 (Toss Payments SDK)
        │   ├── Payment.scss          # ✅ 결제 스타일
        │   ├── PaymentSuccess.jsx    # ✅ 결제 성공 페이지
        │   ├── PaymentSuccess.scss   # ✅ 성공 스타일
        │   ├── PaymentFail.jsx       # ✅ 결제 실패 페이지
        │   ├── PaymentFail.scss      # ✅ 실패 스타일
        │   ├── MyPage.jsx            # ✅ 마이페이지 (예약내역, 포인트, 프로필)
        │   ├── MyPage.scss           # ✅ 마이페이지 스타일
        │   ├── ReviewWrite.jsx       # ✅ 리뷰 작성 (별점, 사진 5장, 500P)
        │   ├── ReviewWrite.scss      # ✅ 리뷰 스타일
        │   ├── BusinessDashboard.jsx # ✅ 사업자 대시보드 (호텔/객실관리)
        │   ├── BusinessDashboard.scss# ✅ 대시보드 스타일
        │   ├── BusinessApprovalPending.jsx # ✅ 사업자 승인 대기
        │   ├── AddHotel.jsx          # ✅ 호텔 등록
        │   ├── AddHotel.scss         # ✅ 호텔 등록 스타일
        │   ├── AddRoom.jsx           # ✅ 객실 등록 (할인 설정)
        │   ├── AddRoom.scss          # ✅ 객실 등록 스타일
        │   ├── AdminDashboard.jsx    # ✅ 관리자 대시보드
        │   ├── AdminDashboard.scss   # ✅ 관리자 스타일
        │   ├── FAQ.jsx               # ✅ 자주 묻는 질문
        │   ├── FAQ.scss              # ✅ FAQ 스타일
        │   ├── Support.jsx           # ✅ 고객센터 (문의 등록)
        │   ├── Support.scss          # ✅ 고객센터 스타일
        │   ├── Terms.jsx             # ✅ 이용약관
        │   ├── Terms.scss            # ✅ 이용약관 스타일
        │   ├── Privacy.jsx           # ✅ 개인정보처리방침
        │   └── Privacy.scss          # ✅ 개인정보 스타일
        │
        └── utils/
            └── api.js                # ✅ Axios 인스턴스 (인터셉터)
```

## 🔑 주요 기능별 파일

### 🔐 인증 시스템
```
backend/src/routes/auth.js              # API: 회원가입, 로그인, 카카오 OAuth
backend/src/middleware/auth.js          # JWT 토큰 검증
backend/src/utils/jwt.js                # 토큰 생성
frontend/src/context/AuthContext.jsx    # 클라이언트 인증 상태
frontend/src/pages/Login.jsx            # 로그인 UI
frontend/src/pages/Register.jsx         # 회원가입 UI
frontend/src/pages/KakaoCallback.jsx    # 카카오 로그인 콜백
frontend/src/pages/CompleteProfile.jsx  # 프로필 완성 모달
```

### 🏨 호텔 검색 & 예약
```
backend/src/models/Hotel.js             # 호텔 데이터 모델
backend/src/models/Room.js              # 객실 데이터 모델 (할인가, 원가, 할인율)
backend/src/routes/hotels.js            # 호텔 API (검색, 필터링, 객실 관리)
backend/scripts/createSampleHotels.js   # 샘플 데이터 10개 생성
frontend/src/components/SearchBar.jsx   # 검색바 (15개 도시, 날짜, 1-5성급)
frontend/src/components/HotelCard.jsx   # 호텔 카드
frontend/src/pages/HotelList.jsx        # 호텔 목록
frontend/src/pages/HotelDetail.jsx      # 호텔 상세 (할인 배지, 카카오맵)
frontend/src/pages/Reservation.jsx      # 예약 페이지
frontend/src/pages/AddHotel.jsx         # 호텔 등록 (사업자)
frontend/src/pages/AddRoom.jsx          # 객실 등록 (할인 설정)
frontend/src/hooks/useKakaoMap.js       # 카카오맵 SDK
```

### 💳 결제 시스템
```
backend/src/routes/payments.js          # Toss Payments API
backend/src/models/Reservation.js       # 예약 데이터
frontend/src/pages/Payment.jsx          # 결제 페이지 (SDK 연동)
frontend/src/pages/PaymentSuccess.jsx   # 결제 성공
frontend/src/pages/PaymentFail.jsx      # 결제 실패
```

### ⭐ 리뷰 시스템
```
backend/src/models/Review.js            # 리뷰 데이터 (신고 기능)
backend/src/routes/reviews.js           # 리뷰 API (작성, 수정, 삭제, 신고)
frontend/src/pages/ReviewWrite.jsx      # 리뷰 작성 (500P 적립)
frontend/src/pages/HotelDetail.jsx      # 리뷰 표시 (수정/삭제/신고 버튼)
```

### 👨‍💼 사업자 & 관리자
```
backend/src/routes/admin.js             # 관리자 전용 API (통계, 승인, 문의)
backend/src/routes/support.js           # 고객지원 API (FAQ, 문의)
backend/scripts/createAdmin.js          # 관리자 계정 생성
frontend/src/pages/BusinessDashboard.jsx # 사업자 대시보드 (객실 관리)
frontend/src/pages/AdminDashboard.jsx   # 관리자 대시보드 (문의 탭)
frontend/src/pages/FAQ.jsx              # 자주 묻는 질문
frontend/src/pages/Support.jsx          # 고객센터
frontend/src/pages/Terms.jsx            # 이용약관
frontend/src/pages/Privacy.jsx          # 개인정보처리방침
frontend/src/components/common/Footer.jsx # 푸터 (노션 링크)
```

### 📤 파일 업로드
```
backend/src/middleware/upload.js        # Multer 설정 (5MB)
backend/src/routes/upload.js            # 업로드 API
backend/uploads/                        # 업로드된 파일
```

## 🎨 스타일링 시스템

### 전역 스타일
```
frontend/src/assets/css/global.scss     # 애니메이션, 스크롤바, 유틸리티
frontend/src/App.scss                   # 홈 페이지 (floating circles)
```

### 컴포넌트 스타일 (SCSS)
```
Header.scss         # 네비게이션, 그라디언트 로고
HotelCard.scss      # 호버 효과, 애니메이션
SearchBar.scss      # 골드 버튼, floating circles
HotelList.scss      # 그리드, 페이지네이션
Login.scss          # 애니메이션 배경
```

## 🗄️ 데이터베이스 (MongoDB)

### 컬렉션
```
users           # 사용자 (일반/사업자/관리자)
hotels          # 호텔 (10개 샘플)
rooms           # 객실
reservations    # 예약
reviews         # 리뷰
coupons         # 쿠폰
```

### 샘플 데이터 (생성됨 ✅)
```
- 서울 그랜드 호텔 (5성급, 3개 객실)
- 부산 해운대 리조트 (5성급, 2개 객실)
- 제주 신라 호텔 (5성급, 2개 객실)
- 강릉 경포 호텔 (4성급, 2개 객실)
- 경주 힐튼 호텔 (4성급, 2개 객실)
- 인천 파라다이스 시티 (5성급, 2개 객실)
- 대구 인터불고 호텔 (4성급, 2개 객실)
- 광주 라마다 호텔 (4성급, 2개 객실)
- 전주 한옥 게스트하우스 (3성급, 2개 객실)
- 속초 켄싱턴 리조트 (4성급, 2개 객실)
```

## 🚀 실행 명령어

### Backend
```bash
cd backend
npm install                 # 의존성 설치
npm run create-admin        # 관리자 계정 생성
npm run create-hotels       # 샘플 호텔 생성
npm run dev                 # 개발 서버 실행 (port 3000)
```

### Frontend
```bash
cd frontend
npm install                 # 의존성 설치
npm run dev                 # 개발 서버 실행 (port 5173)
```

## 🔐 관리자 계정

```
이메일: happysun0142@gmail.com
비밀번호: love7942@
역할: admin
```

## 🌐 API 엔드포인트

### 인증
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/kakao
- POST /api/auth/logout

### 호텔
- GET /api/hotels (검색, 필터: 도시, 가격, 날짜, 1-5성급)
- GET /api/hotels/:id
- POST /api/hotels (사업자)

### 예약
- GET /api/reservations
- POST /api/reservations
- PUT /api/reservations/:id/cancel

### 결제
- POST /api/payments/confirm (Toss)

### 리뷰
- GET /api/reviews
- POST /api/reviews (500P 적립)

### 관리자
- GET /admin/stats
- PUT /admin/users/:id/approve
- PUT /admin/hotels/:id/status

## 📦 주요 패키지

### Backend (173 packages)
- express 4.18.2
- mongoose 8.0.0
- bcryptjs 2.4.3
- jsonwebtoken 9.0.2
- multer 2.0.2
- helmet 7.1.0
- cors 2.8.5

### Frontend (329 packages)
- react 18.2.0
- vite 5.0.0
- react-router-dom 6.20.0
- axios 1.6.0
- sass 1.69.5
- @tosspayments/payment-sdk

## 🎨 디자인 시스템

### 색상
- Primary: #667eea → #764ba2 (보라 그라디언트)
- Gold: #FFD700 → #FFA500 (검색 버튼)
- Success: #059669
- Danger: #dc2626

### 애니메이션
- fadeIn, fadeInUp, fadeInDown
- scaleIn
- float (floating circles)

### 반응형
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px
