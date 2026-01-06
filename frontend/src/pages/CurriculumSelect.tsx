import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { allDataCurriculums } from '../data/dataAnalysisCurriculum';
import { allAICurriculums } from '../data/aiCodingCurriculum';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './CurriculumSelect.css';

type CurriculumType = 'data' | 'ai';

export default function CurriculumSelect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const initialTab = tab === 'ai' ? 'ai' : 'data';
  const [selectedType, setSelectedType] = useState<CurriculumType>(initialTab);

  useEffect(() => {
    const newType = tab === 'ai' ? 'ai' : 'data';
    if (newType !== selectedType) {
      setSelectedType(newType);
    }
  }, [tab, selectedType]);

  const curriculums = selectedType === 'data' ? allDataCurriculums : allAICurriculums;

  const handleSelect = (curriculumId: string) => {
    // 추후 해당 커리큘럼 학습 페이지로 이동
    navigate(`/learn/${curriculumId}`);
  };

  return (
    <div className="curriculum-select-page">
      <Header />

      <main className="curriculum-main">
        {/* Hero Section */}
        <section className="curriculum-hero">
          <h1>
            <i className="fi fi-rr-graduation-cap"></i> 수준별 커리큘럼
          </h1>
          <p>초등학교부터 고등학교까지, 나에게 맞는 수준을 선택하세요!</p>
        </section>

        {/* Type Selector */}
        <div className="type-selector">
          <button
            className={`type-btn ${selectedType === 'data' ? 'active' : ''}`}
            onClick={() => setSelectedType('data')}
          >
            <i className="fi fi-rr-chart-histogram"></i>
            <span>데이터 분석과 시각화</span>
          </button>
          <button
            className={`type-btn ${selectedType === 'ai' ? 'active' : ''}`}
            onClick={() => setSelectedType('ai')}
          >
            <i className="fi fi-rr-robot"></i>
            <span>AI 코딩</span>
          </button>
        </div>

        {/* Curriculum Cards */}
        <div className="curriculum-cards">
          {curriculums.map((curriculum) => {
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
              <p>기본적인 파이썬 문법을 알고 있는 초등학생을 위한 과정입니다.
              재미있는 예제와 시각적인 결과물로 흥미롭게 배울 수 있어요!</p>
            </div>
            <div className="info-card middle">
              <h3><i className="fi fi-rr-book-open-cover"></i> 중학교</h3>
              <p>파이썬 기초를 마친 중학생을 위한 과정입니다.
              pandas, matplotlib 등 실제 라이브러리를 사용해 데이터를 다뤄요!</p>
            </div>
            <div className="info-card high">
              <h3><i className="fi fi-rr-diploma"></i> 고등학교</h3>
              <p>심화 학습을 원하는 고등학생을 위한 과정입니다.
              통계 분석, 머신러닝, 신경망 등 고급 주제를 다룹니다!</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
