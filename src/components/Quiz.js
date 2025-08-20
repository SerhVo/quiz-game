import React, { useState, useEffect, useCallback, useRef } from "react";
import Question from "./Question";
import Results from "./Results";
import SetupTopic from "./SetupTopic";
import SetupSize from "./SetupSize";
import SetupName from "./SetupName";

const Quiz = ({
  onQuizStart,
  onQuizEnd,
  onQuizLoad,
  onAnswerFeedback,
  onHeaderChange,
  onRestartQuiz,
}) => {
  const [allQuestions, setAllQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [animationClass, setAnimationClass] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [totalTime, setTotalTime] = useState(null);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [quizSize, setQuizSize] = useState(null);

  const [loadingError, setLoadingError] = useState(null);
  const [quizStage, setQuizStage] = useState("setup-topic");

  const [answerFeedback, setAnswerFeedback] = useState({
    answered: false,
    isCorrect: null,
    correctAnswer: null,
  });

  const [infoMessage, setInfoMessage] = useState("");

  const timerRef = useRef(null);

  const swearWords = ["матюк", "лайка", "слово", "ненорматив", "fuck", "shit"];
  const topics = [
    "Загальні питання",
    "Географія",
    "Історія",
    "Біологія",
    "Фізика",
    "Хімія",
    "Література",
    "Мова",
    "Інформатика",
    "Математика",
  ];

  const topicFileMap = {
    "Загальні питання": "general_questions.js",
    Географія: "geography.js",
    Історія: "history.js",
    Біологія: "biology.js",
    Фізика: "physics.js",
    Хімія: "chemistry.js",
    Література: "literature.js",
    Мова: "ukrainian_language.js",
    Інформатика: "computer_science.js",
    Математика: "mathematics.js",
  };

  const handleAnswerClick = useCallback(
    (selectedOption) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const currentQuestion = questions[currentQuestionIndex];
      const isCorrect = selectedOption === currentQuestion.correctAnswer;
      onAnswerFeedback(isCorrect);

      setAnswerFeedback({
        answered: true,
        isCorrect: isCorrect,
        correctAnswer: currentQuestion.correctAnswer,
      });

      setInfoMessage(
        isCorrect ? "Відповідь правильна ✅" : "Відповідь неправильна ❌"
      );

      if (isCorrect) {
        setScore((prevScore) => prevScore + 1);
      }

      setAnimationClass("fade-out");

      setTimeout(() => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < questions.length) {
          setCurrentQuestionIndex(nextQuestionIndex);
          setAnswerFeedback({
            answered: false,
            isCorrect: null,
            correctAnswer: null,
          });
          setInfoMessage("");
        } else {
          const endTime = new Date();
          const elapsedTimeInSeconds = Math.floor((endTime - startTime) / 1000);
          setTotalTime(elapsedTimeInSeconds);
          setQuizStage("results");
          onQuizEnd();
        }
      }, 2000);
    },
    [questions, currentQuestionIndex, onAnswerFeedback, startTime, onQuizEnd]
  );

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizSize(null);
    setSelectedTopic(null);
    setUserName("");
    setError("");
    setTotalTime(null);
    setQuizStage("setup-topic");
    setAnswerFeedback({
      answered: false,
      isCorrect: null,
      correctAnswer: null,
    });
    setInfoMessage("");
    onRestartQuiz();
  };

  useEffect(() => {
    if (selectedTopic) {
      setLoadingError(null);
      setQuizStage("loading");
      const fileName = topicFileMap[selectedTopic];

      if (!fileName) {
        console.error("Помилка: Немає відповідного файлу для обраної теми.");
        setLoadingError(
          "Не вдалося завантажити питання: назва файлу некоректна."
        );
        return;
      }

      import(`../data/${fileName}`)
        .then((module) => {
          setAllQuestions(module.questions);
          onQuizLoad?.(selectedTopic);
          setQuizStage("setup-size");
        })
        .catch((error) => {
          console.error("Помилка завантаження питань:", error);
          setLoadingError(
            "Не вдалося завантажити питання. Перевірте, чи існують файли."
          );
        });
    }
  }, [selectedTopic, onQuizLoad]);

  useEffect(() => {
    switch (quizStage) {
      case "setup-topic":
        onHeaderChange("Оберіть тему");
        break;
      case "loading":
        onHeaderChange("Завантаження питань...");
        break;
      case "setup-size":
        onHeaderChange("Оберіть кількість питань");
        break;
      case "setup-name":
        onHeaderChange("Як тебе звати?");
        break;
      case "playing":
        onHeaderChange(selectedTopic);
        break;
      case "results":
        onHeaderChange("Результати");
        break;
      default:
        onHeaderChange("Квіз");
        break;
    }
  }, [quizStage, onHeaderChange, selectedTopic]);

  useEffect(() => {
    if (quizStage === "playing") {
      setTimeLeft(30);
      setAnimationClass("fade-in");

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleAnswerClick(null);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizStage, currentQuestionIndex, handleAnswerClick]);

  const getRandomQuestions = (count) => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const validateName = (name) => {
    const trimmedName = name.trim();
    const ukrainianRegex = /^[А-ЯІЇЄҐа-яіїєґ\s]+$/;
    const words = trimmedName.split(/\s+/);

    if (trimmedName === "") {
      return "Будь ласка, введіть своє ім'я.";
    }
    if (!ukrainianRegex.test(trimmedName)) {
      return "Ім'я має містити лише українські літери.";
    }
    if (words.length > 2) {
      return "Ім'я може складатися з одного або двох слів.";
    }
    if (swearWords.some((word) => trimmedName.toLowerCase().includes(word))) {
      return "Будь ласка, оберіть інше ім'я.";
    }
    if (
      trimmedName.length > 2 &&
      !/[аеиіоуяєюїі]/.test(trimmedName.toLowerCase())
    ) {
      return "Ім'я не може бути випадковим набором літер.";
    }
    return "";
  };

  const handleNameChange = (e) => {
    let name = e.target.value;
    if (name.length > 0) {
      name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    setUserName(name);
  };

  const handleStartQuiz = (e) => {
    e.preventDefault();
    const validationError = validateName(userName);

    if (validationError) {
      setError(validationError);
    } else {
      setError("");
      setQuestions(getRandomQuestions(quizSize));
      setStartTime(new Date());
      setQuizStage("playing");
      onQuizStart();
    }
  };

  if (loadingError) {
    return (
      <div className="start-container">
        <p className="error-message">{loadingError}</p>
        <button onClick={() => setSelectedTopic(null)} className="start-button">
          Повернутися до вибору теми
        </button>
      </div>
    );
  }

  switch (quizStage) {
    case "setup-topic":
      return (
        <SetupTopic
          topics={topics}
          onSelectTopic={(topic) => setSelectedTopic(topic)}
        />
      );
    case "loading":
      return <div>Завантаження питань...</div>;
    case "setup-size":
      return (
        <SetupSize
          selectedTopic={selectedTopic}
          onSelectSize={(size) => {
            setQuizSize(size);
            setQuizStage("setup-name");
          }}
        />
      );
    case "setup-name":
      return (
        <SetupName
          userName={userName}
          onNameChange={handleNameChange}
          onStartQuiz={handleStartQuiz}
          error={error}
        />
      );
    case "playing":
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) {
        return <div>Питання не знайдено.</div>;
      }
      return (
        <>
          <div className="quiz-container">
            <div className="timer">
              Час:{" "}
              <span className={timeLeft <= 5 ? "red-text" : ""}>
                {timeLeft}
              </span>
            </div>
            <div className="question-counter">
              Питання {currentQuestionIndex + 1} з {questions.length}
            </div>
          </div>
          {infoMessage && <p className="info-message">{infoMessage}</p>}
          <div className={`question-card-animated ${animationClass}`}>
            <Question
              question={currentQuestion.question}
              options={currentQuestion.options}
              onAnswerClick={handleAnswerClick}
              answerFeedback={answerFeedback}
            />
          </div>
        </>
      );
    case "results":
      return (
        <Results
          score={score}
          totalQuestions={questions.length}
          userName={userName}
          totalTime={totalTime}
          onRestartQuiz={handleRestart}
          quizEndTime={new Date()}
        />
      );
    default:
      return <div>Невідомий етап квізу.</div>;
  }
};

export default Quiz;
