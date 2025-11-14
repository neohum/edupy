import './Footer.css';

interface FooterProps {
  showGitHub?: boolean;
}

export default function Footer({ showGitHub = true }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container">
        <p>© 2025 EduPy. 모든 학습 데이터는 브라우저에 안전하게 저장됩니다.</p>
        {showGitHub && (
          <p className="footer-links">
            <a href="https://github.com/neohum/edupy" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
        )}
        <p className="footer-made-by">
          Made by <a href="https://schoolworks.kr" target="_blank" rel="noopener noreferrer">schoolworks.kr</a>
        </p>
      </div>
    </footer>
  );
}

