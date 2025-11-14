import type { Curriculum } from '../data/pythonCurriculum';
import './ProgressModal.css';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum: Curriculum;
  completedActivities: Set<string>;
  currentLevelIndex: number;
  currentActivityIndex: number;
  onActivityClick: (levelIndex: number, activityIndex: number) => void;
}

export default function ProgressModal({
  isOpen,
  onClose,
  curriculum,
  completedActivities,
  currentLevelIndex,
  currentActivityIndex,
  onActivityClick,
}: ProgressModalProps) {
  if (!isOpen) return null;

  const totalActivities = curriculum.levels.reduce((sum, level) => sum + level.activities.length, 0);
  const completedCount = completedActivities.size;
  const progressPercentage = Math.round((completedCount / totalActivities) * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 학습 진행 상황</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* 전체 진행률 */}
          <div className="progress-summary">
            <div className="progress-stat">
              <div className="stat-label">전체 진행률</div>
              <div className="stat-value">{progressPercentage}%</div>
            </div>
            <div className="progress-stat">
              <div className="stat-label">완료한 활동</div>
              <div className="stat-value">{completedCount} / {totalActivities}</div>
            </div>
          </div>

          {/* Level별 진행 상황 */}
          <div className="levels-progress">
            {curriculum.levels.map((level, levelIndex) => {
              const levelCompleted = level.activities.filter(activity =>
                completedActivities.has(activity.id)
              ).length;

              return (
                <div key={levelIndex} className="level-section">
                  <div className="level-header">
                    <h3>Level {level.level}: {level.title}</h3>
                    <span className="level-progress-badge">
                      {levelCompleted} / {level.activities.length}
                    </span>
                  </div>

                  <div className="activities-grid">
                    {level.activities.map((activity, activityIndex) => {
                      const isCompleted = completedActivities.has(activity.id);
                      const isCurrent = levelIndex === currentLevelIndex && activityIndex === currentActivityIndex;

                      return (
                        <button
                          key={activity.id}
                          className={`activity-card ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                          onClick={() => {
                            onActivityClick(levelIndex, activityIndex);
                            onClose();
                          }}
                          title={activity.title}
                        >
                          <div className="activity-card-id">{activity.id}</div>
                          <div className="activity-card-title">{activity.title}</div>
                          {isCompleted && <div className="activity-card-check">✓</div>}
                          {isCurrent && <div className="activity-card-badge">현재</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

