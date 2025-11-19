import { Link, useLocation } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  title?: string;
  showNav?: boolean;
}

export default function Header({ title = '🐍 EduPy', showNav = true }: HeaderProps) {
  const location = useLocation();
  const isLearnPage = location.pathname === '/learn';
  const isHomePage = location.pathname === '/';

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          {title}
        </Link>
        {showNav && (
          <nav className="nav">
            {isLearnPage ? (
              <>
                {/* 학습 메뉴 드롭다운 */}
                <div className="dropdown">
                  <button className="nav-link dropdown-toggle">
                    🐍 학습 메뉴 ▼
                  </button>
                  <div className="dropdown-menu">
                    <a href="https://tt.hancomtaja.com/ko" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                      ⌨️ 한컴 타자 연습
                    </a>
                    <Link to="/python" className="dropdown-item">
                      🐍 파이썬 학습
                    </Link>
                    <Link to="/pygame" className="dropdown-item">
                      📚 파이게임 기초 문법
                    </Link>
                    <div className="dropdown-item disabled">
                      📊 데이터 분석과 시각화 <span className="badge-coming-soon">준비중</span>
                    </div>
                    <div className="dropdown-item disabled">
                      🤖 AI 코딩 <span className="badge-coming-soon">준비중</span>
                    </div>
                    <Link to="/pygame-games" className="dropdown-item">
                      🎮 파이게임 만들기
                    </Link>
                  </div>
                </div>

                <Link to="/admin/login" className="nav-link">
                  🔐 관리자
                </Link>

                <Link to="/" className="nav-link">
                  🏠 홈으로
                </Link>
              </>
            ) : (
              <>
                {isHomePage ? (
                  <>
                    <a href="#features">기능</a>
                    <a href="#about">소개</a>
                  </>
                ) : (
                  <>
                    <Link to="/#features" className="nav-link">기능</Link>
                    <Link to="/#about" className="nav-link">소개</Link>
                  </>
                )}

                {/* 학습 메뉴 드롭다운 */}
                <div className="dropdown">
                  <button className="nav-link dropdown-toggle">
                    🐍 학습 메뉴 ▼
                  </button>
                  <div className="dropdown-menu">
                    <a href="https://tt.hancomtaja.com/ko" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                      ⌨️ 한컴 타자 연습
                    </a>
                    <Link to="/python" className="dropdown-item">
                      🐍 파이썬 학습
                    </Link>
                    <Link to="/pygame" className="dropdown-item">
                      📚 파이게임 기초 문법
                    </Link>
                    <div className="dropdown-item disabled">
                      📊 데이터 분석과 시각화 <span className="badge-coming-soon">준비중</span>
                    </div>
                    <div className="dropdown-item disabled">
                      🤖 AI 코딩 <span className="badge-coming-soon">준비중</span>
                    </div>
                    <Link to="/pygame-games" className="dropdown-item">
                      🎮 파이게임 만들기
                    </Link>
                  </div>
                </div>

                <Link to="/admin/login" className="nav-link">
                  🔐 관리자
                </Link>

                {!isHomePage && (
                  <Link to="/" className="nav-link">
                    🏠 홈으로
                  </Link>
                )}
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

