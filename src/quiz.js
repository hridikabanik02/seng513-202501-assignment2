//FETCH!!
async function fetchQuestions() {
  const response = await fetch('https://opentdb.com/api.php?amount=10&category=10&difficulty=medium&type=multiple');
  const data = await response.json();
  return data.results;
}

// Display Questions
async function displayQuestions() {
  const questions = await fetchQuestions();
  const questionContainer = document.getElementById('question-container');
  
  questions.forEach(q => {
    const questionElement = document.createElement('div');
    questionElement.innerHTML = `<h2>${q.question}</h2>`;
    q.incorrect_answers.concat(q.correct_answer).sort().forEach(choice => {
      const button = document.createElement('button');
      button.textContent = choice;
      questionElement.appendChild(button);
    });
    questionContainer.appendChild(questionElement);
  });
}

document.getElementById('start-btn').addEventListener('click', displayQuestions);