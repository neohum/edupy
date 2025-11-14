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
            타이핑 연습부터 파이썬 학습, 파이게임 기초 문법, 게임 만들기까지<br />
            <strong>회원가입 없이</strong> 바로 시작하세요!
          </p>
          <div className="hero-badges">
            <span className="badge">✅ 회원가입 불필요</span>
            <span className="badge">💾 자동 저장</span>
            <span className="badge">🚀 즉시 시작</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h3 className="section-title">네 가지 학습 모드</h3>
          
          <div className="feature-grid">
            {/* Feature 1: 타이핑 연습 */}
            <div className="feature-card">
              <div className="feature-icon">⌨️</div>
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
              <div className="feature-icon">🐍</div>
              <h4>파이썬 학습</h4>
              <p>기초부터 고급까지 단계별 학습</p>
              <ul className="feature-list">
                <li>인터랙티브 코드 에디터</li>
                <li>실시간 코드 실행</li>
                <li>퀴즈 및 연습 문제</li>
                <li>코드 저장 기능</li>
              </ul>
              <Link to="/python" className="btn btn-primary">시작하기</Link>
            </div>

            {/* Feature 3: 파이게임 기초 문법 학습 */}
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h4>파이게임 기초 문법 학습</h4>
              <p>게임 개발에 필요한 파이썬 문법</p>
              <ul className="feature-list">
                <li>변수·연산·함수 (캐릭터 관리)</li>
                <li>조건문·반복문 (이동·입력)</li>
                <li>리스트·딕셔너리 (적·아이템·점수)</li>
                <li>random·while (랜덤·애니메이션)</li>
              </ul>
              <button className="btn btn-primary" disabled>준비 중</button>
            </div>

            {/* Feature 4: 파이게임 만들기 */}
            <div className="feature-card">
              <div className="feature-icon">🎮</div>
              <h4>파이게임 만들기</h4>
              <p>나만의 게임을 만들어보세요</p>
              <ul className="feature-list">
                <li>Pygame 튜토리얼</li>
                <li>실시간 게임 미리보기</li>
                <li>프로젝트 자동 저장</li>
                <li>예제 게임 제공</li>
              </ul>
              <button className="btn btn-primary" disabled>준비 중</button>
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
              <div className="about-icon">🔒</div>
              <h5>프라이버시 보호</h5>
              <p>회원가입 없이 사용하며, 모든 데이터는 브라우저에만 저장됩니다</p>
            </div>
            
            <div className="about-item">
              <div className="about-icon">💾</div>
              <h5>자동 저장</h5>
              <p>학습 진행도가 자동으로 저장되어 언제든 이어서 학습할 수 있습니다</p>
            </div>
            
            <div className="about-item">
              <div className="about-icon">📤</div>
              <h5>데이터 백업</h5>
              <p>JSON 파일로 데이터를 내보내고 다른 기기에서 가져올 수 있습니다</p>
            </div>
            
            <div className="about-item">
              <div className="about-icon">⚡</div>
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

