document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = localStorage.getItem('url') || '';
    const quizTitleEl = document.getElementById('quiz-title');
    const questionsContainerEl = document.getElementById('quiz-questions-container');
    const submitQuizBtnEl = document.getElementById('submit-quiz-btn');
    const quizResultContainerEl = document.getElementById('quiz-result-container');

    const urlParams = new URLSearchParams(window.location.search);
    const quiz_id = urlParams.get('quiz_id');

    // Store user_id from session storage
    let student_id = null;
    try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (user && user.id) {
            student_id = user.id;
        }
    } catch (e) {
        console.error("Error parsing user from session storage:", e);
    }

    if (!quiz_id) {
        questionsContainerEl.innerHTML = '<p class="text-danger">Quiz ID not found in URL. Please go back and select a quiz.</p>';
        if(submitQuizBtnEl) submitQuizBtnEl.style.display = 'none';
        if(quizTitleEl) quizTitleEl.textContent = 'Error';
        return;
    }

    if (!student_id) {
        questionsContainerEl.innerHTML = '<p class="text-danger">Student information not found. Please log in again.</p>';
        if(submitQuizBtnEl) submitQuizBtnEl.style.display = 'none';
        if(quizTitleEl) quizTitleEl.textContent = 'Error';
        return;
    }

    // Optional: Fetch quiz title separately if needed, or set a generic one
    // For now, we'll assume the HTML placeholder is fine until questions load.
    // if(quizTitleEl) quizTitleEl.textContent = `Attempting Quiz...`;


    async function fetchAndDisplayQuiz(currentQuizId) {
        const fetchUrl = `${apiUrl}backend/student/get_quiz.php?quiz_id=${currentQuizId}`;

        try {
            const response = await fetch(fetchUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            if (responseData.status === 0 && responseData.questions && responseData.questions.length > 0) {
                questionsContainerEl.innerHTML = ''; // Clear loading/error messages

                // Optionally set quiz title if provided by API, for now using a generic one
                if(quizTitleEl) quizTitleEl.textContent = `Quiz Attempt (ID: ${currentQuizId})`;


                const form = document.createElement('form');
                form.id = 'quiz-form';

                responseData.questions.forEach((question, index) => {
                    const questionBlock = document.createElement('div');
                    questionBlock.classList.add('question-block');
                    questionBlock.dataset.questionId = question.question_id;

                    const questionText = document.createElement('p');
                    questionText.classList.add('fw-semibold');
                    questionText.textContent = `${index + 1}. ${question.question_text}`;
                    questionBlock.appendChild(questionText);

                    const options = [
                        { key: 'a', text: question.option_a },
                        { key: 'b', text: question.option_b },
                    ];
                    if (question.option_c && question.option_c.trim() !== '') {
                        options.push({ key: 'c', text: question.option_c });
                    }
                    if (question.option_d && question.option_d.trim() !== '') {
                        options.push({ key: 'd', text: question.option_d });
                    }

                    options.forEach(opt => {
                        const label = document.createElement('label');
                        label.classList.add('quiz-option');

                        const radio = document.createElement('input');
                        radio.type = 'radio';
                        radio.name = `question_${question.question_id}`;
                        radio.value = opt.key;
                        radio.required = true; // Make each question required

                        label.appendChild(radio);
                        label.appendChild(document.createTextNode(` ${opt.text}`)); // Add space before option text
                        questionBlock.appendChild(label);
                    });
                    form.appendChild(questionBlock);
                });
                questionsContainerEl.appendChild(form);
                if(submitQuizBtnEl) submitQuizBtnEl.style.display = 'block'; // Show submit button

                form.addEventListener('submit', (event) => handleQuizSubmit(event, currentQuizId));

            } else {
                questionsContainerEl.innerHTML = `<p class="text-danger">${responseData.message || 'No questions found for this quiz.'}</p>`;
                if(submitQuizBtnEl) submitQuizBtnEl.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching quiz data:', error);
            questionsContainerEl.innerHTML = '<p class="text-danger">Error fetching quiz questions. Please check your connection and try again.</p>';
            if(submitQuizBtnEl) submitQuizBtnEl.style.display = 'none';
        }
    }

    async function handleQuizSubmit(event, currentQuizId) {
        event.preventDefault();

        const answers = [];
        const questionBlocks = document.querySelectorAll('#quiz-form .question-block');
        let allAnswered = true;

        questionBlocks.forEach(block => {
            const question_id = block.dataset.questionId;
            const selectedRadio = block.querySelector('input[type="radio"]:checked');

            if (selectedRadio) {
                answers.push({ question_id: question_id, selected_option: selectedRadio.value });
            } else {
                allAnswered = false;
            }
        });

        if (!allAnswered) {
            if (typeof swal === 'function') {
                swal('Incomplete', 'Please answer all questions before submitting.', 'warning');
            } else {
                alert('Please answer all questions before submitting.');
            }
            return;
        }

        const payload = {
            student_id: student_id, // Retrieved from session storage earlier
            quiz_id: currentQuizId,
            answers: answers
        };

        const submitUrl = `${apiUrl}backend/student/submit_quiz.php`;

        try {
            const response = await fetch(submitUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            if (responseData.status === 0) {
                quizResultContainerEl.innerHTML = `
                    <h5 class="text-success">Quiz Submitted Successfully!</h5>
                    <p>Your score: <strong>${responseData.score} / ${responseData.total_questions}</strong></p>
                `;
                questionsContainerEl.style.display = 'none';
                if(submitQuizBtnEl) submitQuizBtnEl.style.display = 'none';
                 if(quizTitleEl) quizTitleEl.textContent = 'Quiz Completed';


                if (typeof swal === 'function') {
                    swal('Success!', `Your score is ${responseData.score}/${responseData.total_questions}`, 'success');
                }

            } else {
                if (typeof swal === 'function') {
                    swal('Submission Error', responseData.message || 'Could not submit your answers.', 'error');
                } else {
                    alert(responseData.message || 'Could not submit your answers.');
                }
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            if (typeof swal === 'function') {
                swal('Submission Failed', `An error occurred: ${error.message}`, 'error');
            } else {
                alert(`An error occurred: ${error.message}`);
            }
        }
    }

    // Initial call to fetch and display quiz
    if (quiz_id && student_id) {
        fetchAndDisplayQuiz(quiz_id);
    }
});
