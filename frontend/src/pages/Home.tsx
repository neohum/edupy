import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <Header />

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2 className="hero-title">
            파이썬 학습의 모든 것
          </h2>
          <p className="hero-subtitle">
            타이핑 연습부터 파이썬 학습, 파이게임 기초 문법, 데이터 분석과 시각화, AI 코딩, 알고리즘 학습, 게임 만들기까지<br />
            <strong>회원가입 없이</strong> 바로 시작하세요!
          </p>
          <div className="hero-badges">
            <span className="badge"><i className="fi fi-rr-check"></i> 회원가입 불필요</span>
            <span className="badge"><i className="fi fi-rr-disk"></i> 자동 저장</span>
            <span className="badge"><i className="fi fi-rr-rocket"></i> 즉시 시작</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h3 className="section-title">일곱 가지 학습 모드</h3>

          <div className="feature-grid">
            {/* Feature 1: 타이핑 연습 */}
            <div className="feature-card">
              <div className="feature-icon"><i className="fi fi-rr-keyboard"></i></div>
              <h4>한컴 타자 연습</h4>
              <p>전문 타이핑 연습 사이트로 바로가기</p>
              <a
                href="https://tt.hancomtaja.com/ko?pr=D"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                바로가기
              </a>
            </div>

            {/* Feature 2: 파이썬 학습 */}
            <div className="feature-card featured">
              <div className="feature-badge">인기</div>
              <div className="feature-icon"><i className="fi fi-rr-code-simple"></i></div>
              <h4>파이썬 학습</h4>
              <p>기초부터 고급까지 단계별 학습</p>
              <ul className="feature-list">
                <li>Monaco 코드 에디터</li>
                <li>Pyodide 실시간 실행</li>
                <li>50개 단계별 활동</li>
                <li>진행도 자동 저장</li>
              </ul>
              <Link to="/python" className="btn btn-primary">시작하기</Link>
            </div>

            {/* Feature 3: 파이게임 기초 문법 학습 */}
            <div className="feature-card">
              <div className="feature-icon"><i className="fi fi-rr-book-alt"></i></div>
              <h4>파이게임 기초 문법 학습</h4>
              <p>게임 개발에 필요한 파이썬 문법</p>
              <ul className="feature-list">
                <li>변수·연산·함수 (캐릭터 관리)</li>
                <li>조건문·반복문 (이동·입력)</li>
                <li>리스트·딕셔너리 (적·아이템·점수)</li>
                <li>random·while (랜덤·애니메이션)</li>
              </ul>
              <Link to="/pygame" className="btn btn-primary">시작하기</Link>
            </div>

            {/* Feature 4: 데이터 분석과 시각화 */}
            <div className="feature-card">
              <div className="feature-badge">NEW</div>
              <div className="feature-icon"><i className="fi fi-rr-chart-histogram"></i></div>
              <h4>데이터 분석과 시각화</h4>
              <p>데이터를 분석하고 시각화하는 방법 학습</p>
              <ul className="feature-list">
                <li>초등: 리스트와 텍스트 그래프</li>
                <li>중등: pandas와 matplotlib</li>
                <li>고등: 통계 분석과 회귀</li>
                <li>수준별 맞춤 커리큘럼</li>
              </ul>
              <Link to="/data" className="btn btn-primary">시작하기</Link>
            </div>

            {/* Feature 5: AI 코딩 */}
            <div className="feature-card">
              <div className="feature-badge">NEW</div>
              <div className="feature-icon"><i className="fi fi-rr-robot"></i></div>
              <h4>AI 코딩</h4>
              <p>인공지능과 머신러닝 기초 학습</p>
              <ul className="feature-list">
                <li>초등: 조건문과 패턴 인식</li>
                <li>중등: k-NN과 자연어처리</li>
                <li>고등: 신경망과 딥러닝</li>
                <li>수준별 맞춤 커리큘럼</li>
              </ul>
              <Link to="/ai" className="btn btn-primary">시작하기</Link>
            </div>

            {/* Feature 6: 알고리즘 학습 */}
            <div className="feature-card">
              <div className="feature-badge">NEW</div>
              <div className="feature-icon"><i className="fi fi-rr-brain"></i></div>
              <h4>알고리즘 학습</h4>
              <p>논리적 사고력을 키우는 알고리즘</p>
              <ul className="feature-list">
                <li>초등: 순차/선택/반복, 탐색, 정렬</li>
                <li>중등: 이진탐색, 재귀, 스택/큐</li>
                <li>고등: DP, 그래프, 고급 자료구조</li>
                <li>코딩 테스트 대비 완벽 대비</li>
              </ul>
              <Link to="/algorithm" className="btn btn-primary">시작하기</Link>
            </div>

            {/* Feature 7: 파이게임 만들기 */}
            <div className="feature-card">
              <div className="feature-icon"><i className="fi fi-rr-gamepad"></i></div>
              <h4>파이게임 만들기</h4>
              <p>나만의 게임을 만들어보세요</p>
              <ul className="feature-list">
                <li>레벨별 게임 예제 (15개)</li>
                <li>실시간 코드 실행</li>
                <li>단계별 학습 가이드</li>
                <li>사과 먹기부터 슈팅 게임까지</li>
              </ul>
              <Link to="/pygame-games" className="btn btn-primary">시작하기</Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h3 className="section-title">왜 EduPy인가요?</h3>
          
          <div className="about-grid">
            <div className="about-item">
              <div className="about-icon"><i className="fi fi-rr-lock"></i></div>
              <h5>프라이버시 보호</h5>
              <p>회원가입 없이 사용하며, 모든 데이터는 브라우저에만 저장됩니다</p>
            </div>

            <div className="about-item">
              <div className="about-icon"><i className="fi fi-rr-disk"></i></div>
              <h5>자동 저장</h5>
              <p>학습 진행도가 자동으로 저장되어 언제든 이어서 학습할 수 있습니다</p>
            </div>

            <div className="about-item">
              <div className="about-icon"><i className="fi fi-rr-bolt"></i></div>
              <h5>빠른 시작</h5>
              <p>복잡한 가입 절차 없이 클릭 한 번으로 바로 학습을 시작하세요</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

