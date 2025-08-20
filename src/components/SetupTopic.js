import React from "react";

const SetupTopic = ({ topics, onSelectTopic }) => {
  return (
    <div className="start-container">
      <h2>Оберіть тему</h2>
      <div className="options-container">
        {topics.map((topic, index) => (
          <button
            key={index}
            onClick={() => onSelectTopic(topic)}
            className="option-button"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SetupTopic;
