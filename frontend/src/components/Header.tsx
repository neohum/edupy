import { Link, useLocation } from 'react-router-dom';
import ThemeDropdown from './ThemeDropdown';
import LearningMenuDropdown from './LearningMenuDropdown';
import './Header.css';

interface HeaderProps {
  title?: string;
  showNav?: boolean;
}

export default function Header({ title = 'EduPy', showNav = true }: HeaderProps) {
  const location = useLocation();
  const isLearnPage = location.pathname === '/learn';
  const isHomePage = location.pathname === '/';

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-icon">EPY</span>
          {title}
        </Link>
        {showNav && (
          <nav className="nav">
            {isLearnPage ? (
              <>
                {/* 테마 선택 드롭다운 */}
                <ThemeDropdown />

                {/* 학습 메뉴 드롭다운 */}
                <LearningMenuDropdown />

                <Link to="/admin/login" className="nav-link">
                  <i className="fi fi-rr-lock"></i> 관리자
                </Link>

                <Link to="/" className="nav-link">
                  <i className="fi fi-rr-home"></i> 홈으로
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

                {/* 테마 선택 드롭다운 */}
                <ThemeDropdown />

                {/* 학습 메뉴 드롭다운 */}
                <LearningMenuDropdown />

                <Link to="/admin/login" className="nav-link">
                  <i className="fi fi-rr-lock"></i> 관리자
                </Link>

                {!isHomePage && (
                  <Link to="/" className="nav-link">
                    <i className="fi fi-rr-home"></i> 홈으로
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

