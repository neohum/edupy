import { Link, useLocation } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  title?: string;
  showNav?: boolean;
}

export default function Header({ title = '🐍 EduPy', showNav = true }: HeaderProps) {
  const location = useLocation();
  const isErrorManagementPage = location.pathname === '/error-management';
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
            {isErrorManagementPage ? (
              <>
                <Link to="/#features" className="nav-link">기능</Link>
                <Link to="/#about" className="nav-link">소개</Link>

                {/* 파이썬 학습 드롭다운 */}
                <div className="dropdown">
                  <button className="nav-link dropdown-toggle">
                    🐍 파이썬 학습 ▼
                  </button>
                  <div className="dropdown-menu">
                    <a href="https://tt.hancomtaja.com/ko" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                      ⌨️ 한컴 타자 연습
                    </a>
                    <Link to="/learn" className="dropdown-item">
                      🐍 파이썬 학습
                    </Link>
                    <a href="https://pygame-zero.readthedocs.io/ko/latest/" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                      🎮 파이게임 기초 문법
                    </a>
                    <a href="https://pygame-zero.readthedocs.io/ko/latest/introduction.html" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                      🕹️ 파이게임 만들기
                    </a>
                  </div>
                </div>

                <Link to="/" className="nav-link">
                  🏠 홈으로
                </Link>
              </>
            ) : isLearnPage ? (
              <>
              

                {/* 파이썬 학습 드롭다운 */}
                <div className="dropdown">
                  <button className="nav-link dropdown-toggle">
                    🐍 파이썬 학습 ▼
                  </button>
                  <div className="dropdown-menu">
                    <a href="https://tt.hancomtaja.com/ko" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                      ⌨️ 한컴 타자 연습
                    </a>
                    <Link to="/learn" className="dropdown-item">
                      🐍 파이썬 학습
                    </Link>
                    <a href="https://pygame-zero.readthedocs.io/ko/latest/" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                      🎮 파이게임 기초 문법
                    </a>
                    <a href="https://pygame-zero.readthedocs.io/ko/latest/introduction.html" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                      🕹️ 파이게임 만들기
                    </a>
                  </div>
                </div>

                <Link to="/error-management" className="nav-link">
                  🐛 오류 관리
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

                {/* 파이썬 학습 드롭다운 */}
                <div className="dropdown">
                  <button className="nav-link dropdown-toggle">
                    🐍 파이썬 학습 ▼
                  </button>
                  <div className="dropdown-menu">
                    <a href="https://tt.hancomtaja.com/ko" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                      ⌨️ 한컴 타자 연습
                    </a>
                    <Link to="/learn" className="dropdown-item">
                      🐍 파이썬 학습
                    </Link>
                    <a href="https://pygame-zero.readthedocs.io/ko/latest/" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                      🎮 파이게임 기초 문법
                    </a>
                    <a href="https://pygame-zero.readthedocs.io/ko/latest/introduction.html" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                      🕹️ 파이게임 만들기
                    </a>
                  </div>
                </div>

                <Link to="/error-management" className="nav-link">
                  🐛 오류 관리
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

