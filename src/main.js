async function fetchQuestions() {
  const urls = [
    'https://opentdb.com/api.php?amount=5&category=10&difficulty=easy&type=multiple',
    'https://opentdb.com/api.php?amount=5&category=10&difficulty=medium&type=multiple',
  ];

  const promises = urls.map(url => fetch(url).then(res => res.json()));
  const results = await Promise.all(promises);

  // Merge all results into a single array
  const questions = results.flatMap(result => result.results);
  return questions;
}

// Display Questions
async function displayQuestions() {
  const questions = await fetchQuestions();
  const questionContainer = document.getElementById('question-container');
  questionContainer.innerHTML = ''; // Clear previous questions

  questions.forEach(q => {
    const questionElement = document.createElement('div');
    questionElement.innerHTML = `<h2>${q.question}</h2>`;

    const answers = [...q.incorrect_answers, q.correct_answer].sort();
    answers.forEach(choice => {
      const button = document.createElement('button');
      button.textContent = choice;
      questionElement.appendChild(button);
    });

    questionContainer.appendChild(questionElement);
  });
}

document.getElementById('start-btn').addEventListener('click', displayQuestions);