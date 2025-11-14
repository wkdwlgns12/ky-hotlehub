import React from 'react';
import './Terms.scss';

const Privacy = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1>개인정보처리방침</h1>
        
        <div className="privacy-content">
          <section className="privacy-section">
            <p className="highlight">
              HotelHub(이하 "회사")는 이용자의 개인정보를 중요시하며, "정보통신망 이용촉진 및 정보보호 등에 관한 법률", 
              "개인정보보호법" 등 관련 법령을 준수하고 있습니다.
            </p>
          </section>

          <section className="privacy-section">
            <h2>제1조 (수집하는 개인정보 항목)</h2>
            <h3>1. 일반 회원</h3>
            <ul>
              <li><strong>필수항목:</strong> 이메일, 비밀번호, 이름, 전화번호</li>
              <li><strong>선택항목:</strong> 생년월일, 성별</li>
              <li><strong>자동수집:</strong> IP주소, 쿠키, 서비스 이용 기록, 접속 로그</li>
            </ul>

            <h3>2. 사업자 회원</h3>
            <ul>
              <li><strong>필수항목:</strong> 이메일, 비밀번호, 이름, 전화번호, 사업자등록번호, 상호명</li>
              <li><strong>선택항목:</strong> 사업장 주소, 대표자명</li>
            </ul>

            <h3>3. 결제 시</h3>
            <ul>
              <li>신용카드 정보, 계좌 정보 등 (토스페이먼츠를 통해 안전하게 처리되며 회사에 저장되지 않음)</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제2조 (개인정보의 수집 및 이용목적)</h2>
            <ol>
              <li><strong>회원 관리:</strong> 회원제 서비스 제공, 본인확인, 개인식별, 불량회원의 부정이용 방지</li>
              <li><strong>서비스 제공:</strong> 호텔 예약, 결제 처리, 예약 확인 및 취소, 고객 상담</li>
              <li><strong>마케팅 및 광고:</strong> 신규 서비스 개발, 이벤트 정보 제공 (동의한 경우에 한함)</li>
              <li><strong>서비스 개선:</strong> 통계 분석, 서비스 품질 향상</li>
            </ol>
          </section>

          <section className="privacy-section">
            <h2>제3조 (개인정보의 보유 및 이용기간)</h2>
            <p>
              회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 
              단, 다음의 경우에는 명시한 기간 동안 보존합니다.
            </p>
            
            <h3>1. 회사 내부 방침에 의한 정보보유</h3>
            <ul>
              <li>부정이용 기록: 1년</li>
              <li>고객 문의 기록: 3년</li>
            </ul>

            <h3>2. 관련 법령에 의한 정보보유</h3>
            <table>
              <thead>
                <tr>
                  <th>보존 항목</th>
                  <th>보존 근거</th>
                  <th>보존 기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>계약 또는 청약철회 등에 관한 기록</td>
                  <td>전자상거래법</td>
                  <td>5년</td>
                </tr>
                <tr>
                  <td>대금결제 및 재화 등의 공급에 관한 기록</td>
                  <td>전자상거래법</td>
                  <td>5년</td>
                </tr>
                <tr>
                  <td>소비자 불만 또는 분쟁처리에 관한 기록</td>
                  <td>전자상거래법</td>
                  <td>3년</td>
                </tr>
                <tr>
                  <td>접속 로그 기록</td>
                  <td>통신비밀보호법</td>
                  <td>3개월</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="privacy-section">
            <h2>제4조 (개인정보의 제3자 제공)</h2>
            <p>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 
              다만, 다음의 경우에는 예외로 합니다.
            </p>
            <ol>
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ol>

            <h3>서비스 제공을 위한 제3자 제공</h3>
            <table>
              <thead>
                <tr>
                  <th>제공받는 자</th>
                  <th>제공 목적</th>
                  <th>제공 항목</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>예약한 호텔</td>
                  <td>예약 확인 및 서비스 제공</td>
                  <td>예약자명, 전화번호, 체크인/체크아웃 날짜</td>
                </tr>
                <tr>
                  <td>토스페이먼츠</td>
                  <td>결제 처리</td>
                  <td>결제 정보</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="privacy-section">
            <h2>제5조 (개인정보의 파기절차 및 방법)</h2>
            <h3>1. 파기절차</h3>
            <ul>
              <li>이용자가 입력한 정보는 목적이 달성된 후 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.</li>
              <li>동 개인정보는 법률에 의한 경우가 아니고서는 보유 목적 이외의 다른 목적으로 이용되지 않습니다.</li>
            </ul>

            <h3>2. 파기방법</h3>
            <ul>
              <li>전자적 파일 형태: 복구 및 재생이 불가능한 기술적 방법을 사용하여 완전 삭제</li>
              <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제6조 (이용자의 권리와 의무)</h2>
            <ol>
              <li>이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있습니다.</li>
              <li>이용자는 회원탈퇴를 통해 개인정보의 삭제를 요청할 수 있습니다.</li>
              <li>이용자는 자신의 개인정보를 보호할 의무가 있으며, 타인의 정보를 도용하거나 부정 사용해서는 안 됩니다.</li>
              <li>이용자가 본인의 부주의나 관리 소홀로 ID, 비밀번호가 유출되어 발생한 문제에 대해 회사는 책임을 지지 않습니다.</li>
            </ol>
          </section>

          <section className="privacy-section">
            <h2>제7조 (개인정보 보호를 위한 기술적/관리적 대책)</h2>
            <h3>1. 기술적 대책</h3>
            <ul>
              <li>개인정보는 비밀번호에 의해 보호되며, 중요한 데이터는 암호화하여 저장/전송됩니다.</li>
              <li>백신 프로그램을 이용하여 컴퓨터 바이러스에 의한 피해를 방지합니다.</li>
              <li>해킹 등에 대비하여 외부로부터 접근이 통제된 구역에 시스템을 설치합니다.</li>
            </ul>

            <h3>2. 관리적 대책</h3>
            <ul>
              <li>개인정보 관리 책임자를 지정하여 개인정보를 안전하게 관리합니다.</li>
              <li>개인정보에 대한 접근 권한을 최소한의 인원으로 제한합니다.</li>
              <li>개인정보를 취급하는 직원에 대한 교육을 정기적으로 실시합니다.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제8조 (개인정보 관리책임자)</h2>
            <div className="highlight">
              <p>회사는 고객의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 개인정보 관리책임자를 지정하고 있습니다.</p>
              <p><strong>개인정보 관리책임자</strong></p>
              <p>이름: 김호텔</p>
              <p>전화: 1588-1234</p>
              <p>이메일: privacy@hotelhub.com</p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>제9조 (쿠키의 운영 및 거부)</h2>
            <ol>
              <li>회사는 이용자에게 특화된 맞춤서비스를 제공하기 위해 쿠키를 사용합니다.</li>
              <li>쿠키란 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 작은 텍스트 파일로서 이용자의 컴퓨터에 저장됩니다.</li>
              <li>이용자는 쿠키 설치에 대한 선택권을 가지고 있으며, 웹 브라우저의 옵션을 통해 쿠키를 거부할 수 있습니다.</li>
              <li>다만, 쿠키 설치를 거부할 경우 일부 서비스 이용에 어려움이 있을 수 있습니다.</li>
            </ol>
          </section>

          <section className="privacy-section">
            <h2>제10조 (개인정보처리방침의 변경)</h2>
            <p>
              이 개인정보처리방침은 2025년 1월 1일부터 시행됩니다. 
              법령, 정책 또는 보안기술의 변경에 따라 내용의 추가, 삭제 및 수정이 있을 시에는 
              변경사항 시행 7일 전부터 공지사항을 통해 알릴 것입니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
