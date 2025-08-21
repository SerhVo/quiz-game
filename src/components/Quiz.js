import React, { useState, useEffect, useCallback, useRef } from "react";
import Question from "./Question";
import Results from "./Results";
import SetupTopic from "./SetupTopic";
import SetupSize from "./SetupSize";
import SetupName from "./SetupName";
import History from "./History";

const Quiz = ({
  onQuizStart,
  onQuizEnd,
  onQuizLoad,
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
  const [showHistory, setShowHistory] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  const [loadingError, setLoadingError] = useState(null);
  const [quizStage, setQuizStage] = useState("setup-name");

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

  const getResultFeedback = useCallback((finalScore, totalQuestions) => {
    const percentage = (finalScore / totalQuestions) * 100;
    if (percentage >= 80) {
      return "🤩 Чудово";
    } else if (percentage >= 60) {
      return "👍 Добре";
    } else if (percentage >= 30) {
      return "🙂 Задовільно";
    } else {
      return "😞 Дуже погано";
    }
  }, []);

  const saveResultsToLocalStorage = useCallback(
    (finalScore, totalQuestions, name, time) => {
      const results = JSON.parse(localStorage.getItem("quizResults")) || [];
      const rating = getResultFeedback(finalScore, totalQuestions);
      const newResult = {
        name: name,
        score: finalScore,
        totalQuestions: totalQuestions,
        time: time,
        date: new Date().toISOString(),
        topic: selectedTopic,
        rating: rating,
      };
      results.push(newResult);
      localStorage.setItem("quizResults", JSON.stringify(results));
    },
    [selectedTopic, getResultFeedback]
  );

  const handleAnswerClick = useCallback(
    (selectedOption) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        console.log("Таймер зупинено після вибору відповіді");
      }

      const currentQuestion = questions[currentQuestionIndex];
      const isCorrect = selectedOption === currentQuestion.correctAnswer;

      setAnswerFeedback({
        answered: true,
        isCorrect: isCorrect,
        correctAnswer: currentQuestion.correctAnswer,
      });

      setInfoMessage(
        isCorrect ? "Відповідь правильна ✅" : "Відповідь неправильна ❌"
      );

      const nextScore = isCorrect ? score + 1 : score;
      setScore(nextScore);
      console.log(`Наступний рахунок: ${nextScore}`);

      setAnimationClass("fade-out");

      setTimeout(() => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        console.log(`Перехід до питання: ${nextQuestionIndex}`);
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
          saveResultsToLocalStorage(
            nextScore,
            questions.length,
            userName,
            elapsedTimeInSeconds
          );
          setQuizStage("results");
          onQuizEnd();
          console.log("Квіз завершено, перехід до результатів");
        }
      }, 2000);
    },
    [
      questions,
      currentQuestionIndex,
      startTime,
      onQuizEnd,
      score,
      userName,
      saveResultsToLocalStorage,
    ]
  );

  const handleRestart = () => {
    console.log("Перезапуск квізу");
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizSize(null);
    setSelectedTopic(null);
    setUserName("");
    setError("");
    setTotalTime(null);
    setQuizStage("setup-name");
    setAnswerFeedback({
      answered: false,
      isCorrect: null,
      correctAnswer: null,
    });
    setInfoMessage("");
    onRestartQuiz();
  };

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      setUserName(savedName);
      setShowWelcomeMessage(true);
      console.log(`Знайдено збережене ім'я: ${savedName}`);
    }
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      console.log(`Обрано тему: ${selectedTopic}. Завантаження питань...`);
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
          console.log(
            "Питання завантажено. Перехід до вибору кількості питань."
          );
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
    console.log(`Поточний етап квізу: ${quizStage}`);
    if (showHistory) {
      onHeaderChange("Історія ігор");
      return;
    }
    if (showWelcomeMessage) {
      onHeaderChange("З поверненням!");
      return;
    }
    switch (quizStage) {
      case "setup-name":
        onHeaderChange("Як тебе звати?");
        break;
      case "setup-topic":
        onHeaderChange("Оберіть тему");
        break;
      case "loading":
        onHeaderChange("Завантаження питань...");
        break;
      case "setup-size":
        onHeaderChange("Оберіть кількість питань");
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
  }, [
    quizStage,
    onHeaderChange,
    selectedTopic,
    showHistory,
    showWelcomeMessage,
  ]);

  // ❗ ВИПРАВЛЕНО: Додано перевірку, щоб нескінченний цикл не запускався
  useEffect(() => {
    // Перевіряємо, чи ми на етапі гри і чи є питання
    if (quizStage === "playing" && questions.length > 0) {
      // Перевіряємо, чи поточний індекс питання не виходить за межі масиву
      if (currentQuestionIndex < questions.length) {
        console.log(
          "Запуск нового таймера для питання",
          currentQuestionIndex + 1
        );
        setTimeLeft(30);
        setAnimationClass("fade-in");

        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        const countdown = setInterval(() => {
          setTimeLeft((prevTime) => {
            console.log(`Таймер: ${prevTime - 1}`);
            if (prevTime <= 1) {
              clearInterval(timerRef.current);
              handleAnswerClick(null);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);

        timerRef.current = countdown;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizStage, currentQuestionIndex, questions.length, handleAnswerClick]);

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
      localStorage.setItem("userName", userName);
      setQuizStage("setup-topic");
    }
  };

  const handleContinue = () => {
    setShowWelcomeMessage(false);
    setQuizStage("setup-topic");
  };

  const handleNewUser = () => {
    setShowWelcomeMessage(false);
    setUserName("");
    localStorage.removeItem("userName");
    setQuizStage("setup-name");
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

  if (showHistory) {
    return <History onReturnToResults={() => setShowHistory(false)} />;
  }

  if (showWelcomeMessage) {
    return (
      <div className="welcome-container">
        <h2>Ласкаво просимо назад, {userName}!</h2>
        <p>Хочеш продовжити гру з цим іменем?</p>
        <div className="welcome-buttons">
          <button onClick={handleContinue} className="continue-button">
            Продовжити
          </button>
          <button onClick={handleNewUser} className="new-user-button">
            Змінити ім'я
          </button>
        </div>
      </div>
    );
  }

  switch (quizStage) {
    case "setup-name":
      return (
        <SetupName
          userName={userName}
          onNameChange={handleNameChange}
          onStartQuiz={handleStartQuiz}
          error={error}
        />
      );
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
            setQuestions(getRandomQuestions(size));
            setStartTime(new Date());
            setQuizStage("playing");
            onQuizStart();
            console.log("Розмір квізу обрано. Перехід до гри.");
          }}
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
          onShowHistory={() => setShowHistory(true)}
          quizEndTime={new Date()}
          getResultFeedback={getResultFeedback}
        />
      );
    default:
      return <div>Невідомий етап квізу.</div>;
  }
};

export default Quiz;
