import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB 연결 성공\n');

    const email = 'happysun0142@gmail.com';
    const password = 'love7942@';

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ 사용자를 찾을 수 없습니다.');
      process.exit(1);
    }

    console.log('✅ 사용자 찾음:', user.email);
    console.log('입력한 비밀번호:', password);
    console.log('저장된 해시:', user.password.substring(0, 20) + '...');

    const isMatch = await user.comparePassword(password);
    
    if (isMatch) {
      console.log('\n✅ 비밀번호 일치! 로그인 성공');
    } else {
      console.log('\n❌ 비밀번호 불일치! 로그인 실패');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러:', error.message);
    process.exit(1);
  }
};

testLogin();
