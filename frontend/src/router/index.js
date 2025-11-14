import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '../views/LoginPage.vue'
import PasswordSetting from '../views/PasswordSetting.vue'
import PaymentMethod from '../views/PaymentMethod.vue'
import SignUp from '../views/SignUp.vue'
import FindPassword from '../views/FindPassword.vue'
import Authenticate from '../views/Authenticate.vue'
import HotelAccommodation from '../views/HotelAccommodation.vue'
import HotelSearch from '../views/HotelSearch.vue'
import HotelListing from '../views/HotelListing.vue'
import PaymentBody from '../views/PaymentBody.vue'
import PaymentSuccess from '../views/PaymentSuccess.vue'
import PaymentFail from '../views/PaymentFail.vue'
import UserProfile from '../views/UserProfile.vue'
import FavoritePage from '../views/pages/FavoritePage.vue'
import SocialSignUp from '../views/SocialSignUp.vue'


const router = createRouter({
    history: createWebHistory(),
    routes : [
        { path: '/', name: 'Home', component: HotelSearch},
        {
            path: '/password-setting/:userEmail/:verificationCode',
            name: 'Password_Setting',
            component: PasswordSetting
        },
        { path: '/paymentMethod', name:"PaymentMethod", component: PaymentMethod },
        { path: '/signUp', name:"SignUp", component: SignUp},
        { path: '/findPassword', name:"FindPassword", component: FindPassword},
        { path: '/accommodation/:comId', name:"HotelAccommodation", component: HotelAccommodation },
        {
            path: '/authenticate/:userEmail',
            name: 'Authenticate',
            component: Authenticate
        },
        { path: '/login', name:"loginPage", component: LoginPage, meta: { layout: 'login' } },
        { path: '/hotellisting', name:"HotelListing", component: HotelListing},
        { path: '/payment', name: "PaymentBody", component: PaymentBody},
        { path: '/profile', name: "UserProfile", component: UserProfile},
        { path: '/payment', name: "PaymentBody", component: PaymentBody},
        { path: '/payment/success', name: "PaymentSuccess", component: PaymentSuccess},
        { path: '/payment/fail', name: "PaymentFail", component: PaymentFail},
        { path: '/favorite', name:"FavoritePage", component: FavoritePage},
        {
            path: '/signup/additional-info',
            name: 'SocialSignUp',
            component: SocialSignUp
        },
        {
            path: '/accommodation',
            name: 'HotelAccommodationRedirect',
            component: HotelListing
        }
    ]
})
// ⬇️ ‼️ 이 "문지기" 코드를 통째로 추가하세요 ‼️ ⬇️
router.beforeEach((to, from, next) => {

    // 1. URL에서 토큰과 userId를 가져옵니다.
    const token = to.query.token;
    const userId = to.query.userId;

    let pathChanged = false;

    // 2. URL에 토큰이 있다면
    if (token) {
        // 3. ‼️ 'jwtToken' ‼️ 키로 저장합니다. (이전의 'token' 키가 아님)
        localStorage.setItem('jwtToken', token);
        pathChanged = true;
    }

    // 4. URL에 userId가 있다면 (이건 이미 잘 되고 있었습니다)
    if (userId) {
        localStorage.setItem('userId', userId);
        pathChanged = true;
    }

    // 5. 토큰이나 userId가 URL에 있었다면,
    //    토큰 정보를 숨긴 깨끗한 경로로 "교체"합니다.
    if (pathChanged) {
        // next({ path: to.path })를 사용하면
        // API 요청 전에 페이지가 렌더링되어 똑같은 오류가 날 수 있으므로
        // window.location.pathname을 사용해 페이지를 확실하게 새로고침합니다.
        window.location.href = to.path;
    } else {
        // 6. URL에 토큰이 없는 일반적인 이동
        next();
    }
});



export default router