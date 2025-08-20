import React, { useState, useEffect } from "react";
import "./App.css";
import Quiz from "./components/Quiz";

function App() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [headerTitle, setHeaderTitle] = useState("Квіз");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const backgrounds = [
    "background_1.jpg",
    "background_2.jpg",
    "background_3.jpg",
    "background_4.jpg",
    "background_5.jpg",
    "background_6.jpg",
    "background_7.jpg",
    "background_8.jpg",
    "background_9.jpg",
    "background_10.jpg",
    "background_11.jpg",
  ];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    const selectedBackground = backgrounds[randomIndex];
    setBackgroundImage(selectedBackground);
  }, []);

  useEffect(() => {
    if (backgroundImage) {
      document.body.style.backgroundImage = `url(${process.env.PUBLIC_URL}/images/${backgroundImage})`;
    }
  }, [backgroundImage]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return date.toLocaleDateString("uk-UA", options);
  };

  const startQuiz = () => {
    setShowQuiz(true);
    setHeaderTitle("Оберіть тему");
  };

  const endQuiz = () => {
    console.log("Quiz ended in App.js");
  };

  const onHeaderChange = (newTitle) => {
    setHeaderTitle(newTitle);
  };

  const onAnswerFeedback = (isCorrect) => {
    console.log(`Відповідь ${isCorrect ? "правильна" : "неправильна"}`);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  // Функція для скидання вікторини
  const handleRestartQuiz = () => {
    setShowQuiz(false);
    setHeaderTitle("Квіз");
  };

  return (
    <div className="App">
      <div className="date-time-display">{formatDate(currentTime)}</div>
      <header className="App-header">
        <h1 className="App-title">{headerTitle}</h1>
        <button onClick={handleMuteToggle} className="mute-button">
          {isMuted ? "🔇" : "🔊"}
        </button>
      </header>
      <main>
        {!showQuiz ? (
          <div className="start-container">
            <button onClick={startQuiz} className="start-button">
              Почати
            </button>
          </div>
        ) : (
          <Quiz
            onQuizStart={() => console.log("Quiz started")}
            onQuizEnd={endQuiz}
            onHeaderChange={onHeaderChange}
            onAnswerFeedback={onAnswerFeedback}
            isMuted={isMuted}
            onRestartQuiz={handleRestartQuiz} // <-- Ось тут була відсутня передача
          />
        )}
      </main>
      <footer>
        <p className="footer-text"> SerhVo &copy; 2025 Всі права захищені</p>
      </footer>
    </div>
  );
}

export default App;
