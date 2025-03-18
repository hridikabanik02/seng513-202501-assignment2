import { User } from './user.js';  // Import the User class

class Quiz {
    constructor() {
        // Arrays for questions based on difficulty
        this.easyQuestions = [];
        this.mediumQuestions = [];
        this.hardQuestions = [];
        
        this.currentIndex = 0; // Overall question counter (for display purposes)
        this.totalQuestions = 10;  // Limit quiz to 10 questions
        this.score = 0;
        this.difficulty = "easy";  // Starting difficulty
        this.usedQuestions = new Set(); 
        this.user = null;  // To hold the User instance

        // DOM elements
        this.startBtn = document.getElementById("start-btn");
        this.quizTitle = document.getElementById("quizTitle");
        this.usernameField = document.getElementById("username");
        this.quizContainer = document.getElementById("quiz-container");
        // Save the original quiz container HTML to restore it on restart.
        this.quizContainerOriginalHTML = this.quizContainer.innerHTML;

        // Other quiz elements (will be re-assigned later on restart)
        this.questionNumberText = document.getElementById("question-number");
        this.questionContainer = document.getElementById("question-container");
        this.scoreText = document.getElementById("score-text");
        this.difficultyText = document.getElementById("difficulty-text");

        // Bind startQuiz to the START button
        this.startBtn.addEventListener("click", () => this.startQuiz());
    }

    async fetchQuestions() {
        const apiUrl = `https://opentdb.com/api.php?amount=30`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            // Clear previous question arrays
            this.easyQuestions = [];
            this.mediumQuestions = [];
            this.hardQuestions = [];

            data.results.forEach(q => {
                if (!this.usedQuestions.has(q.question)) {
                    this.usedQuestions.add(q.question);
                    // Combine incorrect and correct answers for options
                    const options = [...q.incorrect_answers, q.correct_answer];
                    const questionObj = new Question(q.question, options, q.correct_answer);

                    // Distribute the question into the correct difficulty array
                    if (q.difficulty === "easy") {
                        this.easyQuestions.push(questionObj);
                    } else if (q.difficulty === "medium") {
                        this.mediumQuestions.push(questionObj);
                    } else if (q.difficulty === "hard") {
                        this.hardQuestions.push(questionObj);
                    }
                }
            });
        } catch (error) {
            alert("Error: Couldn't fetch questions. Try again later.");
        }
    }

    async startQuiz() {
        // If no user exists, this is the very first start.
        if (!this.user) {
            const username = this.usernameField.value.trim();
            if (!username) {
                alert("Please enter your username to start the quiz.");
                return;
            }
            this.user = new User(username);
            console.log("User created:", this.user);
            this.quizTitle.textContent = `Welcome, ${username}!`;
            // Hide the home screen elements.
            this.usernameField.style.display = "none";
            this.startBtn.style.display = "none";
            this.quizTitle.style.display = "none"; 
        } else {
            // If restarting, restore the original quiz container structure.
            this.quizContainer.innerHTML = this.quizContainerOriginalHTML;
            // Reassign DOM elements because innerHTML replacement removes previous references.
            this.questionNumberText = document.getElementById("question-number");
            this.questionContainer = document.getElementById("question-container");
            this.scoreText = document.getElementById("score-text");
            this.difficultyText = document.getElementById("difficulty-text");
        }
        
        // Ensure the quiz container is visible.
        this.quizContainer.style.display = "block";

        // Reset quiz parameters
        this.currentIndex = 0;
        this.score = 0;
        this.difficulty = "easy";
        this.usedQuestions.clear();

        // Fetch new questions (30 total, split by difficulty)
        await this.fetchQuestions();
        this.nextQuestion();
    }

    nextQuestion() {
        // End quiz if we've reached the total number of questions.
        if (this.currentIndex >= this.totalQuestions) {
            this.endQuiz();
            return;
        }

        let question;
        // Select a question based on current difficulty
        if (this.difficulty === "easy") {
            question = this.easyQuestions.shift();
        } else if (this.difficulty === "medium") {
            question = this.mediumQuestions.shift();
        } else if (this.difficulty === "hard") {
            question = this.hardQuestions.shift();
        }

        // If no question is available for the current difficulty, end the quiz.
        if (!question) {
            this.endQuiz();
            return;
        }

        this.currentIndex++;
        this.questionNumberText.innerText = "Question " + this.currentIndex + " of " + this.totalQuestions;
        this.displayQuestion(question);
    }

    displayQuestion(question) {
        if (!question) {
            console.error("Error: No question available.");
            return;
        }

        // Clear previous question content and display the new question
        this.questionContainer.innerHTML = `<h2 class="">${question.text}</h2>`;

        // Create answer buttons for each option
        question.choices.forEach(choice => {
            const button = document.createElement("button");
            button.textContent = choice;
            button.onclick = this.handleAnswer.bind(this, question, choice);
            this.questionContainer.appendChild(button);
        });

        // Update score and difficulty display
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
        } else if (this.difficulty === "medium") {
            this.difficulty = "hard";
        }
    }

    decreaseDifficulty() {
        if (this.difficulty === "hard") {
            this.difficulty = "medium";
        } else if (this.difficulty === "medium") {
            this.difficulty = "easy";
        }
    }

    endQuiz() {
        this.user.updateScore(this.score)
        // Display final score and complete score history.
        this.quizContainer.innerHTML = `
            <h2>Game Finished! Final Score: ${this.score} / ${this.totalQuestions}</h2>
            <div>Score History: ${this.user.getScoreHistory().join(", ")}</div>
        `;

        const restartButton = document.createElement("button");
        restartButton.innerText = "Restart Quiz";
        // Restart quiz without returning to the home screen.
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
