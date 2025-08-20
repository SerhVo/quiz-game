const fs = require("fs");
const path = require("path");

const inputDir = path.join(__dirname, "public", "questions");
const outputDir = path.join(__dirname, "src", "data");

// Створюємо папку для виводу, якщо її ще немає
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Помилка при читанні папки:", err);
    return;
  }

  files.forEach((file) => {
    if (path.extname(file) === ".txt") {
      const inputPath = path.join(inputDir, file);
      const outputFileName = path.basename(file, ".txt") + ".js";
      const outputPath = path.join(outputDir, outputFileName);

      fs.readFile(inputPath, "utf8", (readErr, data) => {
        if (readErr) {
          console.error(`Помилка при читанні файлу ${file}:`, readErr);
          return;
        }

        const lines = data.trim().split("\n").filter(Boolean);
        const parsedQuestions = lines
          .map((line) => {
            const parts = line.split("|");
            if (parts.length < 2) {
              console.warn(`Пропущено некоректний рядок у ${file}: "${line}"`);
              return null;
            }
            const question = parts[0].trim();
            const options = parts.slice(1, -1).map((opt) => opt.trim());
            const correctAnswer = parts[parts.length - 1].trim();

            return {
              question,
              options,
              correctAnswer,
            };
          })
          .filter(Boolean);

        const jsContent = `export const questions = ${JSON.stringify(
          parsedQuestions,
          null,
          2
        )};\n`;

        fs.writeFile(outputPath, jsContent, "utf8", (writeErr) => {
          if (writeErr) {
            console.error(
              `Помилка при записі файлу ${outputFileName}:`,
              writeErr
            );
          } else {
            console.log(`Файл ${outputFileName} успішно створено.`);
          }
        });
      });
    }
  });
});
