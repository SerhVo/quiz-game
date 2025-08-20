import React, { useState, useEffect } from "react";


const History = ({ onReturnToResults }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedResults = JSON.parse(localStorage.getItem("quizResults")) || [];
    setHistory(storedResults);
  }, []);

  if (history.length === 0) {
    return (
      <div className="history-container">
        <p>Історія результатів порожня.</p>
        <button onClick={onReturnToResults} className="history-button">
          Повернутися
        </button>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2>Історія ігор</h2>
      <button onClick={onReturnToResults} className="history-button">
        Повернутися
      </button>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Ім'я</th>
              <th>Тема</th>
              <th>Результат</th>
              <th>Час</th>
              <th>Дата</th>
              <th>Оцінка</th>
            </tr>
          </thead>
          <tbody>
            {history.map((game, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{game.name}</td>
                <td>{game.topic}</td>
                <td>
                  {game.score} / {game.totalQuestions}
                </td>
                <td>{game.time}  сек.</td>
                    <td>{new Date(game.date).toLocaleDateString()}</td>
                <td>{game.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
