import React from "react";

const Results = ({
  score,
  totalQuestions,
  userName,
  totalTime,
  onRestartQuiz,
  quizEndTime,
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

  const getResultFeedback = () => {
    const percentage = (score / totalQuestions) * 100;
    let emoji = "";
    let message = "";

    if (percentage >= 80) {
      emoji = "🤩";
      message = "Чудово";
    } else if (percentage >= 60) {
      emoji = "👍";
      message = "Добре";
    } else if (percentage >= 30) {
      emoji = "🙂";
      message = "Задовільно";
    } else {
      emoji = "😞";
      message = "Дуже погано";
    }

    return `${emoji} ${message}`;
  };

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
        Ваш результат: {getResultFeedback()}
      </p>
      <div className="score-table">
        <h3>Таблиця результатів</h3>
        <table>
          <thead>
            <tr>
              <th>Ім'я</th>
              <th>Дата та час</th>
              <th>Кількість питань</th>
              <th>Витрачений час</th>
              <th>Бали</th>
              <th>Результат</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{userName}</td>
              <td>{formatDateTime(quizEndTime)}</td>
              <td>{totalQuestions}</td>
              <td>{formatTime(totalTime)}</td>
              <td>{score}</td>
              <td>{getResultFeedback()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button onClick={onRestartQuiz} className="restart-button">
        Спробувати ще
      </button>
    </div>
  );
};

export default Results;
