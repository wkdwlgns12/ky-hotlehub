import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import models
import User from '../src/models/User.js';

const addPointsHistory = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Find admin user
    const adminEmail = 'happysun0142@gmail.com';
    const user = await User.findOne({ email: adminEmail });

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current points: ${user.points}`);

    // Sample points history
    const sampleHistory = [
      {
        type: 'earned',
        amount: 5000,
        description: '회원가입 축하 포인트',
        date: new Date('2024-01-15')
      },
      {
        type: 'earned',
        amount: 3000,
        description: '첫 예약 완료 적립',
        date: new Date('2024-02-20')
      },
      {
        type: 'used',
        amount: 2000,
        description: '서울 호텔 예약 시 사용',
        date: new Date('2024-03-10')
      },
      {
        type: 'earned',
        amount: 10000,
        description: '리뷰 작성 이벤트 적립',
        date: new Date('2024-04-05')
      },
      {
        type: 'earned',
        amount: 2000,
        description: '예약 완료 적립 (제주 호텔)',
        date: new Date('2024-05-12')
      },
      {
        type: 'used',
        amount: 5000,
        description: '부산 호텔 예약 시 사용',
        date: new Date('2024-06-18')
      },
      {
        type: 'earned',
        amount: 15000,
        description: '생일 축하 포인트',
        date: new Date('2024-07-01')
      },
      {
        type: 'earned',
        amount: 8000,
        description: '추천인 가입 보너스',
        date: new Date('2024-08-25')
      },
      {
        type: 'used',
        amount: 10000,
        description: '강릉 호텔 예약 시 사용',
        date: new Date('2024-09-30')
      },
      {
        type: 'earned',
        amount: 5000,
        description: '앱 다운로드 이벤트 적립',
        date: new Date('2024-10-15')
      }
    ];

    // Calculate total points
    let totalPoints = 0;
    for (const item of sampleHistory) {
      if (item.type === 'earned') {
        totalPoints += item.amount;
      } else if (item.type === 'used') {
        totalPoints -= item.amount;
      }
    }

    // Update user
    user.pointsHistory = sampleHistory;
    user.points = totalPoints;
    await user.save();

    console.log('\n✅ Points history added successfully!');
    console.log(`Total earned: ${sampleHistory.filter(h => h.type === 'earned').reduce((sum, h) => sum + h.amount, 0).toLocaleString()}P`);
    console.log(`Total used: ${sampleHistory.filter(h => h.type === 'used').reduce((sum, h) => sum + h.amount, 0).toLocaleString()}P`);
    console.log(`Current balance: ${totalPoints.toLocaleString()}P`);
    console.log(`History items: ${sampleHistory.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addPointsHistory();
