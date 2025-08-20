import React from "react";

const SetupSize = ({ selectedTopic, onSelectSize }) => {
  return (
    <div className="start-container">
      <h2>Тема: {selectedTopic}</h2>
      
      <div className="options-container">
        <button onClick={() => onSelectSize(5)} className="option-button">
          5 питань
        </button>
        <button onClick={() => onSelectSize(10)} className="option-button">
          10 питань
        </button>
        <button onClick={() => onSelectSize(15)} className="option-button">
          15 питань
        </button>
        <button onClick={() => onSelectSize(20)} className="option-button">
          20 питань
        </button>
      </div>
    </div>
  );
};

export default SetupSize;
