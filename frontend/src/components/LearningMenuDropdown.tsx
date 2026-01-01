import { Link } from 'react-router-dom';

export default function LearningMenuDropdown() {
  return (
    <div className="dropdown">
      <button className="nav-link dropdown-toggle">
        <i className="fi fi-rr-book-open-reader"></i> 학습 메뉴 <i className="fi fi-rr-angle-down"></i>
      </button>
      <div className="dropdown-menu">
        <a href="https://tt.hancomtaja.com/ko" target="_blank" rel="noopener noreferrer" className="dropdown-item">
          <i className="fi fi-rr-keyboard"></i> 한컴 타자 연습
        </a>
        <Link to="/python" className="dropdown-item">
          <i className="fi fi-rr-code-simple"></i> 파이썬 학습
        </Link>
        <Link to="/pygame" className="dropdown-item">
          <i className="fi fi-rr-book-alt"></i> 파이게임 기초 문법
        </Link>
        {/* 데이터 분석 서브메뉴 */}
        <div className="dropdown-submenu">
          <div className="dropdown-item has-submenu">
            <i className="fi fi-rr-angle-left submenu-arrow"></i>
            <span><i className="fi fi-rr-chart-histogram"></i> 데이터 분석과 시각화</span>
          </div>
          <div className="submenu">
            <Link to="/learn/data-elementary" className="dropdown-item">
              <i className="fi fi-rr-smile"></i> 초등학교
            </Link>
            <Link to="/learn/data-middle" className="dropdown-item">
              <i className="fi fi-rr-book-open-cover"></i> 중학교
            </Link>
            <Link to="/learn/data-high" className="dropdown-item">
              <i className="fi fi-rr-diploma"></i> 고등학교
            </Link>
          </div>
        </div>
        {/* AI 코딩 서브메뉴 */}
        <div className="dropdown-submenu">
          <div className="dropdown-item has-submenu">
            <i className="fi fi-rr-angle-left submenu-arrow"></i>
            <span><i className="fi fi-rr-robot"></i> AI 코딩</span>
          </div>
          <div className="submenu">
            <Link to="/learn/ai-elementary" className="dropdown-item">
              <i className="fi fi-rr-smile"></i> 초등학교
            </Link>
            <Link to="/learn/ai-middle" className="dropdown-item">
              <i className="fi fi-rr-book-open-cover"></i> 중학교
            </Link>
            <Link to="/learn/ai-high" className="dropdown-item">
              <i className="fi fi-rr-diploma"></i> 고등학교
            </Link>
          </div>
        </div>
        <Link to="/pygame-games" className="dropdown-item">
          <i className="fi fi-rr-gamepad"></i> 파이게임 만들기
        </Link>
      </div>
    </div>
  );
}
