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
    let currentIndex = 0;
    
    let currentQuestionScore = 0;
    let accumalatedScore = 0;


    let selectedAnswer = '';
    const selectedAnswerText = document.getElementById('selected-answer-text');

    function showQuestion(index) {
        questionContainer.innerHTML = ''; //where everything is displayed.
        const q = questions[index];  //fetched data

        const questionElement = document.createElement('div');  //creating the sub elmements
        questionElement.innerHTML = `<h2>${q.question}</h2>`;   //sub element


        //generate answer buttons
        q.incorrect_answers.concat(q.correct_answer).sort().forEach(choice => {
          const button = document.createElement('button'); 
          button.textContent = choice;
          button.onclick = () => handleAnswer(choice === q.correct_answer, choice);   //HANDLE ANSWER
          questionElement.appendChild(button);
        });


        questionContainer.appendChild(questionElement); //add element to container


        function handleAnswer(isCorrect, choice) {   //handling the issue at hand
            //alert(isCorrect ? 'Correct!' : 'Wrong!');
            currentQuestionScore = isCorrect ? 1 : 0;
            selectedAnswer = choice;
            selectedAnswerText.textContent = `Selected Answer: ${selectedAnswer}`;

          }


        //Next button handling
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.onclick = () => {
            
          if (currentIndex < questions.length - 1) {
            currentIndex++;

            accumalatedScore = accumalatedScore + currentQuestionScore;
            currentQuestionScore = 0;

            selectedAnswer = '';
            selectedAnswerText.textContent = `Selected Answer: ${selectedAnswer}`;

            showQuestion(currentIndex);
          } else {
            //alert('Quiz Finished!');
            alert((accumalatedScore / 10) * 100 + "%");
          }
        };
        questionContainer.appendChild(nextButton);
      }
    

    
      showQuestion(currentIndex);
    }





    
document.getElementById('start-btn').addEventListener('click', displayQuestions);