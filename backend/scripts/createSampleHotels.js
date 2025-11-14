import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from '../src/models/Hotel.js';
import Room from '../src/models/Room.js';
import User from '../src/models/User.js';

dotenv.config();

const sampleHotels = [
  {
    name: '서울 그랜드 호텔',
    description: '서울 중심부에 위치한 럭셔리 5성급 호텔. 명동 쇼핑가와 가까우며, 최고급 레스토랑과 스파 시설을 갖추고 있습니다.',
    location: { city: '서울', address: '서울시 중구 명동길 123', coordinates: { lat: 37.5665, lng: 126.9780 } },
    rating: 5,
    reviewCount: 487,
    amenities: ['WiFi', '주차', '수영장', '피트니스', '레스토랑', '바', '스파', '컨시어지', '룸서비스'],
    images: [
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', alt: '호텔 외관' },
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', alt: '로비' },
      { url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', alt: '수영장' }
    ],
    rooms: [
      { name: '스탠다드 룸', type: 'standard', price: 150000, capacity: 2, inventory: 10 },
      { name: '디럭스 룸', type: 'deluxe', price: 250000, capacity: 3, inventory: 8 },
      { name: '스위트 룸', type: 'suite', price: 500000, capacity: 4, inventory: 3 }
    ]
  },
  {
    name: '부산 해운대 리조트',
    description: '해운대 해변 바로 앞 오션뷰 특급 리조트. 전 객실에서 환상적인 바다 전망을 즐길 수 있습니다.',
    location: { city: '부산', address: '부산시 해운대구 해운대해변로 456', coordinates: { lat: 35.1586, lng: 129.1603 } },
    rating: 5,
    reviewCount: 392,
    amenities: ['WiFi', '주차', '수영장', '해변', '레스토랑', '바', '사우나', '키즈클럽'],
    images: [
      { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', alt: '해변 리조트' },
      { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', alt: '오션뷰' },
      { url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800', alt: '수영장' }
    ],
    rooms: [
      { name: '오션뷰 룸', type: 'oceanview', price: 200000, capacity: 2, inventory: 15 },
      { name: '패밀리 룸', type: 'family', price: 350000, capacity: 4, inventory: 5 }
    ]
  },
  {
    name: '제주 신라 호텔',
    description: '제주 해안가의 프리미엄 럭셔리 리조트. 골프장과 스파, 미쉐린 레스토랑을 갖춘 최고급 시설입니다.',
    location: { city: '제주', address: '제주시 제주읍 해안로 789', coordinates: { lat: 33.4996, lng: 126.5312 } },
    rating: 5,
    reviewCount: 521,
    amenities: ['WiFi', '주차', '수영장', '골프장', '스파', '레스토랑', '바', '컨시어지'],
    images: [
      { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', alt: '제주 리조트' },
      { url: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800', alt: '정원' },
      { url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', alt: '골프장' }
    ],
    rooms: [
      { name: '가든뷰 룸', type: 'gardenview', price: 180000, capacity: 2, inventory: 12 },
      { name: '오션뷰 스위트', type: 'suite', price: 450000, capacity: 4, inventory: 6 }
    ]
  },
  {
    name: '강릉 경포 호텔',
    description: '경포해변이 한눈에 보이는 모던한 4성급 호텔. 가족 단위 여행객에게 최적화된 시설입니다.',
    location: { city: '강릉', address: '강원도 강릉시 경포로 234', coordinates: { lat: 37.8024, lng: 128.9039 } },
    rating: 4,
    reviewCount: 267,
    amenities: ['WiFi', '주차', '레스토랑', '카페', '헬스장', '세탁실'],
    images: [
      { url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', alt: '호텔 외관' },
      { url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', alt: '해변' }
    ],
    rooms: [
      { name: '스탠다드 룸', type: 'standard', price: 120000, capacity: 2, inventory: 20 },
      { name: '디럭스 룸', type: 'deluxe', price: 180000, capacity: 3, inventory: 10 }
    ]
  },
  {
    name: '경주 힐튼 호텔',
    description: '보문호수 옆 4성급 호텔. 천년 고도 경주의 역사와 현대적 편안함이 조화를 이루는 곳입니다.',
    location: { city: '경주', address: '경북 경주시 보문로 567', coordinates: { lat: 35.8562, lng: 129.2847 } },
    rating: 4,
    reviewCount: 318,
    amenities: ['WiFi', '주차', '수영장', '레스토랑', '피트니스', '비즈니스센터'],
    images: [
      { url: 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800', alt: '호텔 전경' },
      { url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800', alt: '호수뷰' }
    ],
    rooms: [
      { name: '스탠다드 룸', type: 'standard', price: 130000, capacity: 2, inventory: 15 },
      { name: '패밀리 룸', type: 'family', price: 220000, capacity: 4, inventory: 8 }
    ]
  },
  {
    name: '인천 파라다이스 시티',
    description: '인천공항 15분 거리의 초대형 복합 리조트. 카지노, 쇼핑몰, 테마파크가 함께 있는 5성급 시설입니다.',
    location: { city: '인천', address: '인천시 중구 영종해안남로 321', coordinates: { lat: 37.4563, lng: 126.7052 } },
    rating: 5,
    reviewCount: 645,
    amenities: ['WiFi', '주차', '카지노', '수영장', '스파', '쇼핑몰', '레스토랑', '테마파크', '키즈클럽'],
    images: [
      { url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', alt: '리조트' },
      { url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', alt: '카지노' },
      { url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', alt: '실내' }
    ],
    rooms: [
      { name: '디럭스 룸', type: 'deluxe', price: 280000, capacity: 2, inventory: 50 },
      { name: '스위트 룸', type: 'suite', price: 600000, capacity: 4, inventory: 20 }
    ]
  },
  {
    name: '대구 인터불고 호텔',
    description: '동성로 중심가의 비즈니스 특화 3성급 호텔. 합리적인 가격과 깔끔한 시설로 출장객들에게 인기입니다.',
    location: { city: '대구', address: '대구시 중구 동성로 88', coordinates: { lat: 35.8714, lng: 128.6014 } },
    rating: 3,
    reviewCount: 189,
    amenities: ['WiFi', '주차', '레스토랑', '비즈니스센터', '회의실'],
    images: [
      { url: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800', alt: '비즈니스 호텔' },
      { url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', alt: '회의실' }
    ],
    rooms: [
      { name: '비즈니스 룸', type: 'business', price: 90000, capacity: 2, inventory: 30 },
      { name: '이그제큐티브 룸', type: 'executive', price: 140000, capacity: 2, inventory: 15 }
    ]
  },
  {
    name: '광주 라마다 호텔',
    description: '상무지구 중심의 4성급 프리미엄 호텔. 현대적인 시설과 친절한 서비스가 돋보입니다.',
    location: { city: '광주', address: '광주시 서구 상무대로 456', coordinates: { lat: 35.1595, lng: 126.8526 } },
    rating: 4,
    reviewCount: 234,
    amenities: ['WiFi', '주차', '레스토랑', '피트니스', '사우나', '비즈니스센터'],
    images: [
      { url: 'https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800', alt: '호텔' },
      { url: 'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=800', alt: '레스토랑' }
    ],
    rooms: [
      { name: '스탠다드 룸', type: 'standard', price: 110000, capacity: 2, inventory: 25 },
      { name: '디럭스 룸', type: 'deluxe', price: 170000, capacity: 3, inventory: 12 }
    ]
  },
  {
    name: '전주 한옥 게스트하우스',
    description: '전주 한옥마을 중심의 전통 숙소. 한국의 아름다움을 그대로 느낄 수 있는 2성급 게스트하우스입니다.',
    location: { city: '전주', address: '전북 전주시 완산구 한옥마을길 123', coordinates: { lat: 35.8150, lng: 127.1530 } },
    rating: 2,
    reviewCount: 156,
    amenities: ['WiFi', '주차', '한식조식', '공용주방', '테라스'],
    images: [
      { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800', alt: '한옥' },
      { url: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800', alt: '한옥마을' }
    ],
    rooms: [
      { name: '한옥 룸', type: 'hanok', price: 70000, capacity: 2, inventory: 8 },
      { name: '패밀리 한옥', type: 'family', price: 130000, capacity: 4, inventory: 4 }
    ]
  },
  {
    name: '속초 켄싱턴 리조트',
    description: '설악산과 동해바다를 동시에 즐길 수 있는 4성급 리조트. 사계절 내내 다양한 액티비티를 제공합니다.',
    location: { city: '속초', address: '강원도 속초시 해오름로 678', coordinates: { lat: 38.2070, lng: 128.5918 } },
    rating: 4,
    reviewCount: 412,
    amenities: ['WiFi', '주차', '수영장', '스키', '레스토랑', '키즈클럽', '피트니스'],
    images: [
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', alt: '리조트 전경' },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', alt: '설악산' },
      { url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800', alt: '해변' }
    ],
    rooms: [
      { name: '스탠다드 룸', type: 'standard', price: 140000, capacity: 2, inventory: 40 },
      { name: '오션뷰 룸', type: 'oceanview', price: 220000, capacity: 3, inventory: 20 }
    ]
  }
];

const createSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB 연결 성공\n');

    // 관리자 계정 찾기
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ 관리자 계정을 찾을 수 없습니다. 먼저 관리자 계정을 생성하세요.');
      process.exit(1);
    }

    // 기존 데이터 삭제
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    console.log('✅ 기존 호텔 데이터 삭제 완료\n');

    // 샘플 호텔 생성
    for (const hotelData of sampleHotels) {
      const { rooms, ...hotelInfo } = hotelData;
      
      const hotel = new Hotel({
        ...hotelInfo,
        owner: admin._id,
        status: 'approved'
      });
      
      await hotel.save();

      // 객실 생성
      for (const roomData of rooms) {
        const room = new Room({
          ...roomData,
          hotel: hotel._id,
          description: `${roomData.name} - ${hotelInfo.description.split('.')[0]}`,
          amenities: ['WiFi', 'TV', '에어컨', '냉장고', '미니바', '욕조', '샤워실', '헤어드라이기'],
          images: [
            { url: `https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80&room=${Math.random()}`, alt: `${roomData.name} 침대` },
            { url: `https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&room=${Math.random()}`, alt: `${roomData.name} 욕실` }
          ]
        });
        
        await room.save();
        hotel.rooms.push(room._id);
      }
      
      await hotel.save();
      console.log(`✅ ${hotel.name} 생성 완료 (${rooms.length}개 객실)`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ 총 ${sampleHotels.length}개 호텔 생성 완료!`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러:', error.message);
    process.exit(1);
  }
};

createSampleData();
