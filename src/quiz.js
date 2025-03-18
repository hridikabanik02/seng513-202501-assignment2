import { User } from './user.js';

class Quiz {
    //initialising the Quiz object, event listeners and setting some default values
    constructor() {
        this.easyQuestions = [];
        this.mediumQuestions = [];
        this.hardQuestions = [];
        
        this.currentIndex = 0;
        this.totalQuestions = 10;
        this.score = 0;
        this.difficulty = "easy";
        this.usedQuestions = new Set(); 
        this.user = null;

        this.startBtn = document.getElementById("start-btn");
        this.quizTitle = document.getElementById("quizTitle");
        this.usernameField = document.getElementById("username");
        this.quizContainer = document.getElementById("quiz-container");
        this.quizContainerOriginalHTML = this.quizContainer.innerHTML;

        this.questionNumberText = document.getElementById("question-number");
        this.questionContainer = document.getElementById("question-container");
        this.scoreText = document.getElementById("score-text");
        this.difficultyText = document.getElementById("difficulty-text");

        this.startBtn.addEventListener("click", () => this.startQuiz());
    }

    //we fetch 30 questions from the api and then separet them according to their difficulty levels
    async fetchQuestions() {
        const apiUrl = `https://opentdb.com/api.php?amount=30`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            this.easyQuestions = [];
            this.mediumQuestions = [];
            this.hardQuestions = [];

            data.results.forEach(q => {
                if (!this.usedQuestions.has(q.question)) {
                    this.usedQuestions.add(q.question);

                    const options = [...q.incorrect_answers, q.correct_answer];
                    shuffleArray(options);
                    const questionObj = new Question(q.question, options, q.correct_answer);

                    if (q.difficulty === "easy") {
                        this.easyQuestions.push(questionObj);
                    } else if (q.difficulty === "medium") {
                        this.mediumQuestions.push(questionObj);
                    } else if (q.difficulty === "hard") {
                        this.hardQuestions.push(questionObj);
                    }
                }
            });

            this.questionGenerator = this.questionGeneratorFunction();
        } catch (error) {
            alert("Error: Couldn't fetch questions. Try again later.");
        }
    }

    //generator function to yield next question based on what the current difficulty is for user
    *questionGeneratorFunction() {
        while (this.currentIndex < this.totalQuestions) {
            let question;
            if (this.difficulty === "easy") {
                question = this.easyQuestions.shift();
            } else if (this.difficulty === "medium") {
                question = this.mediumQuestions.shift();
            } else if (this.difficulty === "hard") {
                question = this.hardQuestions.shift();
            }
    
            if (!question) {
                return;
            }
            yield question;
        }
    }
    
    //we start the quiz using this fucntion
    async startQuiz() {

        if (!this.user) {
            const username = this.usernameField.value.trim();
            if (!username) {
                alert("Please enter your username to start the quiz.");
                return;
            }
            this.user = new User(username);
            console.log("User created:", this.user);
            this.quizTitle.textContent = `Welcome, ${username}!`;

            this.usernameField.style.display = "none";
            this.startBtn.style.display = "none";
            this.quizTitle.style.display = "none"; 
        } else {
 
            this.quizContainer.innerHTML = this.quizContainerOriginalHTML;

            this.questionNumberText = document.getElementById("question-number");
            this.questionContainer = document.getElementById("question-container");
            this.scoreText = document.getElementById("score-text");
            this.difficultyText = document.getElementById("difficulty-text");
        }

        this.quizContainer.style.display = "block";

        this.currentIndex = 0;
        this.score = 0;
        this.difficulty = "easy";
        this.usedQuestions.clear();

        await this.fetchQuestions();
        this.nextQuestion();
    }

    //used to load the next question 
    nextQuestion() {
        const { value: question, done } = this.questionGenerator.next();
    
        if (done || !question) {
            this.endQuiz();
            return;
        }
    
        this.currentIndex++;
        this.questionNumberText.classList.add("quiz-question-text");
        this.questionNumberText.innerText = `Question ${this.currentIndex} of ${this.totalQuestions}`;
        
        this.displayQuestion(question);
    }

    //used to display current question and creates buttons for answer options
    displayQuestion(question) {
        if (!question) {
            console.error("Error: No question available.");
            return;
        }

        this.questionContainer.innerHTML = `<h2 class=quiz-question-text>${question.text}</h2>`;

        question.choices.forEach(choice => {
            const button = document.createElement("button");
            button.textContent = choice;
            button.onclick = this.handleAnswer.bind(this, question, choice);
            this.questionContainer.appendChild(button);
        });

        this.scoreText.classList.add("quiz-question-text");
        this.difficultyText.classList.add("quiz-question-text");
        this.scoreText.innerText = "Score: " + this.score;
        this.difficultyText.innerText = "Difficulty: " + this.difficulty;
    }

    //handles answer and increases/decreases diffciulty accordingly. Will also display the right and/or wrong answers to user
    handleAnswer(question, choice) {
        const buttons = this.questionContainer.querySelectorAll("button");
    
        buttons.forEach(button => {
            if (button.textContent === question.correctAnswer) {
                button.classList.add("correct-answer");
            } 
            if (button.textContent === choice && choice !== question.correctAnswer) {
                button.classList.add("wrong-answer");
            }
            button.disabled = true;
        });

    
        if (choice === question.correctAnswer) {
            this.score++; 
            this.increaseDifficulty();
        } else {
            this.decreaseDifficulty();
        }
    
        this.scoreText.innerText = "Score: " + this.score;
    
        setTimeout(() => this.nextQuestion(), 1500);
    }

    //to increase difficulty
    increaseDifficulty() {
        if (this.difficulty === "easy") {
            this.difficulty = "medium";
        } else if (this.difficulty === "medium") {
            this.difficulty = "hard";
        }
    }

    //to decrease difficulty
    decreaseDifficulty() {
        if (this.difficulty === "hard") {
            this.difficulty = "medium";
        } else if (this.difficulty === "medium") {
            this.difficulty = "easy";
        }
    }

    //end quiz, user will get to retsrart or end quiz. will also display score history
    endQuiz() {
        this.user.updateScore(this.score)

        this.quizContainer.classList.add("quiz-question-text");
        this.quizContainer.innerHTML = `
            <h2>Game Finished! Final Score: ${this.score} / ${this.totalQuestions}</h2>
            <div>Score History: ${this.user.getScoreHistory().join(", ")}</div>
        `;

        const restartButton = document.createElement("button");
        restartButton.innerText = "Restart Quiz";
        restartButton.onclick = () => this.startQuiz();

        this.quizContainer.appendChild(restartButton);

        const endQuizButton = document.createElement("button");
        endQuizButton.innerText = "End Quiz";
        endQuizButton.onclick = () => window.location.reload();
        this.quizContainer.appendChild(endQuizButton);
    }
}

// Using this function to shuffle the options of a question around
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
}


class Question {
    constructor(text, choices, correctAnswer) {
        this.text = text;
        this.choices = choices;
        this.correctAnswer = correctAnswer;
    }

    //checking if user answer is correct
    isCorrect(option) {
        return option === this.correctAnswer;
    }
}

document.addEventListener("DOMContentLoaded", () => new Quiz());
