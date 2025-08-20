import React from "react";

const SetupName = ({ userName, onNameChange, onStartQuiz, error }) => {
  return (
    <div className="start-container">
      <form onSubmit={onStartQuiz}>
        <input
          type="text"
          placeholder="Введіть своє ім'я"
          value={userName}
          onChange={onNameChange}
          className={`name-input ${error ? "input-error" : ""}`}
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="start-button">
          Почати Квіз
        </button>
      </form>
    </div>
  );
};

export default SetupName;
