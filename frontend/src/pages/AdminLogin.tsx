import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './AdminLogin.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '아이디와 비밀번호를 입력해주세요.',
      });
      return;
    }

    if (requires2FA && !totpCode) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '2FA 인증 코드를 입력해주세요.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          totp_code: totpCode || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2FA 필요 여부 확인
        if (data.requires_2fa) {
          setRequires2FA(true);
          setIsLoading(false);
          Swal.fire({
            icon: 'info',
            title: '2단계 인증',
            text: 'Google Authenticator 앱에서 6자리 코드를 입력해주세요.',
          });
          return;
        }

        // 토큰 저장
        localStorage.setItem('admin_token', data.access_token);
        localStorage.setItem('admin_username', data.username);

        Swal.fire({
          icon: 'success',
          title: '로그인 성공',
          text: `환영합니다, ${data.username}님!`,
          timer: 1500,
          showConfirmButton: false,
        });

        // 대시보드로 이동
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      } else {
        Swal.fire({
          icon: 'error',
          title: '로그인 실패',
          text: data.detail || '아이디 또는 비밀번호가 올바르지 않습니다.',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      Swal.fire({
        icon: 'error',
        title: '로그인 오류',
        text: '서버에 연결할 수 없습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🔐 관리자 로그인</h1>
          <p>EduPy 관리자 페이지</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="관리자 아이디를 입력하세요"
              disabled={isLoading || requires2FA}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              disabled={isLoading || requires2FA}
            />
          </div>

          {requires2FA && (
            <div className="form-group">
              <label htmlFor="totpCode">2FA 인증 코드</label>
              <input
                type="text"
                id="totpCode"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="Google Authenticator 6자리 코드"
                maxLength={6}
                disabled={isLoading}
                autoFocus
              />
              <small style={{ color: '#888', marginTop: '0.5rem', display: 'block' }}>
                📱 Google Authenticator 앱에서 6자리 코드를 확인하세요
              </small>
            </div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? '로그인 중...' : requires2FA ? '2FA 인증' : '로그인'}
          </button>

          {requires2FA && (
            <button
              type="button"
              className="back-button"
              onClick={() => {
                setRequires2FA(false);
                setTotpCode('');
              }}
              disabled={isLoading}
            >
              ← 다시 입력
            </button>
          )}
        </form>

        <div className="back-to-home">
          <a href="/">← 홈으로 돌아가기</a>
        </div>
      </div>
    </div>
  );
}

