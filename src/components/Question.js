import React, { useState } from "react";

const Question = ({ question, options, onAnswerClick, answerFeedback }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (option) => {
    if (!answerFeedback.answered) {
      setSelectedOption(option);
      onAnswerClick(option);
    }
  };

  return (
    <div className="question-container">
      <h2>{question}</h2>
      <div className="options-container">
        {options.map((option, index) => {
          let buttonClass = "option-button";

          if (answerFeedback.answered) {
            buttonClass += " disabled-option";
          }

          return (
            <button
              key={index}
              className={buttonClass}
              onClick={() => handleOptionClick(option)}
              disabled={answerFeedback.answered}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Question;
