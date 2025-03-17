class Quiz {
    constructor() {
        this.questions = [];
        this.questionGenerator = null;
        this.currentIndex = 0;
        this.score = 0;
        this.difficulty = "easy";
        this.usedQuestions = new Set(); 


        this.startBtn = document.getElementById("start-btn");
        this.quizContainer = document.getElementById("quiz-container");
        this.questionContainer = document.getElementById("question-container");
        this.questionNumberText = document.getElementById("question-number");
        this.scoreText = document.getElementById("score-text");
        this.difficultyText = document.getElementById("difficulty-text");

        this.startBtn.addEventListener("click", () => this.startQuiz());
    }

    *questionGeneratorFunction(questions) {
        for (let question of questions) {
            yield question;
        }
    }

    async fetchQuestions() {
        const apiUrl = `https://opentdb.com/api.php?amount=10&difficulty=${this.difficulty}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            this.questions = data.results
                .filter(q => !this.usedQuestions.has(q.question))
                .map(q => {
                    this.usedQuestions.add(q.question); 
                    const options = [...q.incorrect_answers, q.correct_answer];
                    return new Question(
                        q.question,
                        options,
                        q.correct_answer
                    );
                });

                this.questionGenerator = this.questionGeneratorFunction(this.questions);

        } catch (error) {
            alert("Error: Couldn't fetch questions. Try again later.");
        }
    }

    async startQuiz() {
        this.currentIndex = 0;
        this.score = 0;
        this.difficulty = "easy";
        this.usedQuestions.clear(); 

        this.startBtn.style.display = "none";
        this.quizContainer.style.display = "block";

        await this.fetchQuestions();

        this.nextQuestion();
    }

    nextQuestion() {
        if (this.currentIndex >= this.questions.length) {
            this.endQuiz();
            return;
        }

        // const question = this.questions[this.currentIndex];
        const nextResult = this.questionGenerator.next();
        const question = nextResult.value;
        const done = nextResult.done;
        if (done) {
            this.endQuiz();
            return;
        }
        this.currentIndex++;
        this.questionNumberText.innerText = "Question " + this.currentIndex + "/10";

        this.displayQuestion(question);
    }

    displayQuestion(question) {
        if (!question) {
            console.error("Error: Received question undefined. Skipping this.");
            return;
        }

        this.questionContainer.innerHTML = `<h2>${question.text}</h2>`;

        question.choices.forEach(choice => {
            const button = document.createElement("button");
            button.textContent = choice;
            button.onclick = this.handleAnswer.bind(this, question, choice);
            this.questionContainer.appendChild(button);
        });

        
        this.scoreText.innerText = "Score: " + this.score;
        this.difficultyText.innerText = "Difficulty: " + this.difficulty;
    }

    handleAnswer(question, choice) {
        const isCorrect = question.isCorrect(choice);
        if (isCorrect) {
            this.score++;
            this.increaseDifficulty();
        } else {
            this.decreaseDifficulty();
        }

        this.nextQuestion();
    }

    increaseDifficulty() {
        if (this.difficulty === "easy") {
            this.difficulty = "medium";
        }
        else if (this.difficulty === "medium") {
            this.difficulty = "hard";
        }
    }

    decreaseDifficulty() {
        if (this.difficulty === "hard") {
            this.difficulty = "medium";
        }
        else if (this.difficulty === "medium") {
            this.difficulty = "easy";
        }
    }

    endQuiz() {
        this.quizContainer.innerHTML = `<h2>Game Finished! Final Score: ${this.score}</h2>`;

        const restartButton = document.createElement("button");
        restartButton.innerText = "Restart Quiz";
        restartButton.onclick = () => this.startQuiz();

        this.quizContainer.appendChild(restartButton);
    }
}


class Question {
    constructor(text, choices, correctAnswer) {
        this.text = text;
        this.choices = choices;
        this.correctAnswer = correctAnswer;
    }

    isCorrect(option) {
        return option === this.correctAnswer;
    }
}

document.addEventListener("DOMContentLoaded", () => new Quiz());
