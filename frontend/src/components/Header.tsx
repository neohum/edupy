import { Link } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  title?: string;
  showNav?: boolean;
}

export default function Header({ title = '🐍 EduPy', showNav = true }: HeaderProps) {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          {title}
        </Link>
        {showNav && (
          <nav className="nav">
            <a href="#features">기능</a>
            <a href="#about">소개</a>
          </nav>
        )}
      </div>
    </header>
  );
}

