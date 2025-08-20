import React from "react";

const Results = ({
  score,
  totalQuestions,
  userName,
  totalTime,
  onRestartQuiz,
  quizEndTime,
  onShowHistory,
  getResultFeedback, // Отримуємо функцію з props
}) => {
  const formatTime = (seconds) => {
    if (seconds === null) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} хв ${secs} сек`;
  };

  const formatDateTime = (date) => {
    if (!date) return "—";
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("uk-UA", options);
  };

  // getResultClass тепер залежить від відсотка, а не від getResultFeedback
  const getResultClass = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 80) {
      return "excellent";
    } else if (percentage >= 60) {
      return "good";
    } else if (percentage >= 30) {
      return "satisfactory";
    } else {
      return "poor";
    }
  };

  return (
    <div className="results-container">
      <h2 className="welcome-message">Вітаємо, {userName}!</h2>

      <p className={`result-text ${getResultClass()}`}>
        Ваш результат: {getResultFeedback(score, totalQuestions)}
      </p>

      <p className={`result-text ${getResultClass()}`}>
        У тебе: {score} правильних відповідей із {totalQuestions} питань.
      </p>
      <p className={`result-text ${getResultClass()}`}>
        Тобі знадобилось: {formatTime(totalTime)}
      </p>
      <div className="welcome-buttons">
        <button onClick={onRestartQuiz} className="restart-button">
          Спробувати ще
        </button>
        <button onClick={onShowHistory} className="history-button">
          Показати історію
        </button>
      </div>
    </div>
  );
};

export default Results;
