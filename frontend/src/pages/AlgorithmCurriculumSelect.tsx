import { useNavigate } from 'react-router-dom';
import { allAlgorithmCurricula } from '../data/algorithmCurriculum';
import ThemeDropdown from '../components/ThemeDropdown';
import LearningMenuDropdown from '../components/LearningMenuDropdown';
import Footer from '../components/Footer';
import './CurriculumSelect.css';

export default function AlgorithmCurriculumSelect() {
  const navigate = useNavigate();

  const handleSelect = (curriculumId: string) => {
    navigate(`/learn/${curriculumId}`);
  };

  return (
    <div className="curriculum-select-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <h1 className="logo">
            <a href="/"><span className="logo-icon">EPY</span>EduPy</a>
          </h1>

          <div className="page-title-wrapper">
            <h2 className="page-title">
              <i className="fi fi-rr-brain"></i> 알고리즘 학습
            </h2>
          </div>

          <div className="header-right-section">
            {/* 테마 선택 드롭다운 */}
            <ThemeDropdown />

            {/* 학습 메뉴 드롭다운 */}
            <LearningMenuDropdown />

            <a href="/admin/login" className="admin-login-link" title="관리자 로그인">
              <i className="fi fi-rr-lock"></i>
            </a>

            <a href="/" className="nav-link home-link">
              <i className="fi fi-rr-home"></i> 홈으로
            </a>
          </div>
        </div>
      </header>

      <main className="curriculum-main">
        {/* Hero Section */}
        <section className="curriculum-hero">
          <p className="hero-description">논리적 사고력을 키우는 단계별 알고리즘 학습!</p>
        </section>

        {/* Curriculum Cards */}
        <div className="curriculum-cards">
          {allAlgorithmCurricula.map((curriculum) => {
            const totalActivities = curriculum.levels.reduce(
              (sum, level) => sum + level.activities.length,
              0
            );

            return (
              <div
                key={curriculum.id}
                className={`curriculum-card ${curriculum.gradeLevel}`}
                onClick={() => handleSelect(curriculum.id)}
              >
                <div
                  className="card-header"
                  style={{ background: curriculum.color }}
                >
                  <div className="grade-badge">{curriculum.gradeLevelKorean}</div>
                  <i className={curriculum.icon}></i>
                </div>

                <div className="card-body">
                  <h3>{curriculum.title}</h3>
                  <p className="description">{curriculum.description}</p>

                  <div className="stats">
                    <div className="stat">
                      <i className="fi fi-rr-layers"></i>
                      <span>{curriculum.levels.length}개 레벨</span>
                    </div>
                    <div className="stat">
                      <i className="fi fi-rr-document"></i>
                      <span>{totalActivities}개 활동</span>
                    </div>
                  </div>

                  <div className="topics">
                    <h4>주요 학습 내용</h4>
                    <ul>
                      {curriculum.levels.slice(0, 3).map((level) => (
                        <li key={level.level}>
                          <i className="fi fi-rr-check"></i>
                          {level.title}
                        </li>
                      ))}
                      {curriculum.levels.length > 3 && (
                        <li className="more">
                          +{curriculum.levels.length - 3}개 더...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="card-footer">
                  <button className="start-btn">
                    <i className="fi fi-rr-play"></i>
                    학습 시작하기
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <section className="info-section">
          <h2><i className="fi fi-rr-info"></i> 수준별 안내</h2>
          <div className="info-cards">
            <div className="info-card elementary">
              <h3><i className="fi fi-rr-smile"></i> 초등학교</h3>
              <p>순차, 선택, 반복의 기본 개념부터 시작해요.
              재미있는 예제로 탐색과 정렬의 기초를 배워봐요!</p>
            </div>
            <div className="info-card middle">
              <h3><i className="fi fi-rr-book-open-cover"></i> 중학교</h3>
              <p>이진 탐색, 재귀 함수, 스택과 큐를 배우고,
              그래프 탐색 알고리즘을 마스터해봐요!</p>
            </div>
            <div className="info-card high">
              <h3><i className="fi fi-rr-diploma"></i> 고등학교</h3>
              <p>동적 프로그래밍, 그래프 알고리즘 등
              코딩 테스트 대비 고급 알고리즘을 배워요!</p>
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
}
