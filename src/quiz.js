// Global Variables
let currentQuestionIndex = 0;
let questions = [];
let score = 0;

// Fetch Questions from Open Trivia DB (Music Category)
async function fetchQuestions() {
    const response = await fetch('https://opentdb.com/api.php?amount=10&category=12&difficulty=medium&type=multiple');
    const data = await response.json();
    return data.results.map(q => ({
        question: q.question,
        choices: shuffleArray([...q.incorrect_answers, q.correct_answer]),
        correctAnswer: q.correct_answer
    }));
}

// Shuffle function to randomize choices
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Display Current Question
function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showScore();
        return;
    }

    const questionData = questions[currentQuestionIndex];
    document.getElementById('question-text').innerHTML = questionData.question;

    const answerOptions = document.getElementById('answer-options');
    answerOptions.innerHTML = '';

    questionData.choices.forEach(choice => {
        const li = document.createElement('li');
        li.textContent = choice;
        li.classList.add('quiz-option');
        li.addEventListener('click', () => selectAnswer(li, choice, questionData.correctAnswer));
        answerOptions.appendChild(li);
    });

    document.getElementById('next-btn').style.display = "none"; // Hide next button until an answer is selected
}

// Handle Answer Selection
function selectAnswer(selectedElement, selectedAnswer, correctAnswer) {
    const answerOptions = document.querySelectorAll('.quiz-option');
    answerOptions.forEach(option => option.classList.remove('selected'));

    selectedElement.classList.add('selected');

    if (selectedAnswer === correctAnswer) {
        score++;
        selectedElement.style.background = "#33cc33"; // Green for correct
    } else {
        selectedElement.style.background = "#cc3333"; // Red for incorrect
    }

    document.getElementById('next-btn').style.display = "block"; // Show next button after selecting
}

// Show Final Score
function showScore() {
    document.getElementById('question-container').innerHTML = `<h2>Quiz Completed! 🎵</h2><p>Your Score: ${score} / ${questions.length}</p>`;
    document.getElementById('next-btn').style.display = "none";
}

// Move to Next Question
function nextQuestion() {
    currentQuestionIndex++;
    displayQuestion();
}

// Start Quiz
async function startQuiz() {
    questions = await fetchQuestions();
    currentQuestionIndex = 0;
    score = 0;
    displayQuestion();
}

document.getElementById('start-btn').addEventListener('click', startQuiz);
document.getElementById('next-btn').addEventListener('click', nextQuestion);
