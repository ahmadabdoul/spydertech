document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = localStorage.getItem('url') || ''; // Base URL from localStorage

    let currentCourseIdForQuizzes = null;
    let currentSelectedQuizId = null;

    // DOM Elements
    const createQuizForm = document.getElementById('create-quiz-form');
    const viewCourseQuizzesForm = document.getElementById('view-course-quizzes-form');
    const existingQuizzesListDiv = document.getElementById('existing-quizzes-list');
    const addQuestionsSectionDiv = document.getElementById('add-questions-section');
    const selectedQuizTitleDisplay = document.getElementById('selected-quiz-title-display');

    // --- 1. Create New Quiz ---
    if (createQuizForm) {
        createQuizForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const courseIdInput = document.getElementById('course_id');
            const quizTitleInput = document.getElementById('quiz_title');
            const course_id = courseIdInput.value.trim();
            const quiz_title = quizTitleInput.value.trim();

            if (!course_id || !quiz_title) {
                swal('Validation Error', 'Course ID and Quiz Title are required.', 'error');
                return;
            }

            fetch(`${apiUrl}backend/teacher/create_quiz.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_id, quiz_title })
            })
            .then(response => response.json())
            .then(responseData => {
                if (responseData.status === 0) {
                    swal('Success', responseData.message, 'success');
                    createQuizForm.reset();
                    if (currentCourseIdForQuizzes && currentCourseIdForQuizzes === course_id) {
                        fetchAndDisplayQuizzes(currentCourseIdForQuizzes); // Refresh list if current course matches
                    }
                } else {
                    swal('Error', responseData.message || 'An unknown error occurred.', 'error');
                }
            })
            .catch(error => {
                console.error('Error creating quiz:', error);
                swal('Request Failed', `Could not connect to the server: ${error.message}`, 'error');
            });
        });
    }

    // --- 2. Handle "Load Quizzes for Course" Form ---
    if (viewCourseQuizzesForm) {
        viewCourseQuizzesForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const courseIdInput = document.getElementById('view_course_id');
            const courseId = courseIdInput.value.trim();
            if (!courseId) {
                swal('Input Error', 'Please enter a Course ID to view its quizzes.', 'warning');
                return;
            }
            currentCourseIdForQuizzes = courseId;
            existingQuizzesListDiv.innerHTML = '<p>Loading quizzes...</p>'; // Clear previous list
            addQuestionsSectionDiv.innerHTML = '<p>Select a quiz from the list above to view its questions or add new ones.</p>'; // Reset
            if(selectedQuizTitleDisplay) selectedQuizTitleDisplay.textContent = 'No Quiz Selected';
            currentSelectedQuizId = null;
            fetchAndDisplayQuizzes(currentCourseIdForQuizzes);
        });
    }

    // --- 3. Fetch and Display Quizzes for a Course ---
    async function fetchAndDisplayQuizzes(courseId) {
        try {
            const response = await fetch(`${apiUrl}backend/teacher/get_course_quizzes.php?course_id=${courseId}`);
            const responseData = await response.json();

            existingQuizzesListDiv.innerHTML = ''; // Clear previous
            if (responseData.status === 0 && responseData.quizzes.length > 0) {
                const ul = document.createElement('ul');
                ul.className = 'list-group';
                responseData.quizzes.forEach(quiz => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex justify-content-between align-items-center';
                    li.textContent = quiz.title;

                    const manageButton = document.createElement('button');
                    manageButton.className = 'btn btn-sm btn-info manage-quiz-questions-btn';
                    manageButton.textContent = 'Manage Questions';
                    manageButton.dataset.quizId = quiz.quiz_id;
                    manageButton.dataset.quizTitle = quiz.title;
                    li.appendChild(manageButton);
                    ul.appendChild(li);
                });
                existingQuizzesListDiv.appendChild(ul);
            } else if (responseData.status === 0) {
                existingQuizzesListDiv.innerHTML = '<p>No quizzes found for this course.</p>';
            } else {
                existingQuizzesListDiv.innerHTML = `<p class="text-danger">${responseData.message || 'Error fetching quizzes.'}</p>`;
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            existingQuizzesListDiv.innerHTML = `<p class="text-danger">Could not connect to server: ${error.message}</p>`;
        }
    }

    // --- 4. Handle "Manage Questions" Button Click (Event Delegation) ---
    existingQuizzesListDiv.addEventListener('click', function(event) {
        if (event.target.classList.contains('manage-quiz-questions-btn')) {
            const quizId = event.target.dataset.quizId;
            const quizTitle = event.target.dataset.quizTitle;

            currentSelectedQuizId = quizId;
            if(selectedQuizTitleDisplay) selectedQuizTitleDisplay.textContent = quizTitle;

            // Dynamically build the questions management area
            buildQuestionsManagementUI(quizId);
            fetchAndDisplayQuizQuestions(quizId);
        }
    });

    // --- Helper to Build Questions Management UI ---
    function buildQuestionsManagementUI(quizId) {
        addQuestionsSectionDiv.innerHTML = `
            <div id="quiz-questions-management-area">
                <h5>Existing Questions:</h5>
                <div id="current-quiz-questions-list" class="mb-4 list-group">
                    <p>Loading questions...</p>
                </div>

                <h5>Add New Question to This Quiz:</h5>
                <form id="add-question-to-quiz-form">
                    <input type="hidden" id="current_quiz_id_for_new_question" value="${quizId}">
                    <div class="mb-3">
                        <label for="question_text" class="form-label">Question Text:</label>
                        <textarea id="question_text" name="question_text" class="form-control" rows="2" required></textarea>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="option_a" class="form-label">Option A:</label>
                            <input type="text" id="option_a" name="option_a" class="form-control" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="option_b" class="form-label">Option B:</label>
                            <input type="text" id="option_b" name="option_b" class="form-control" required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="option_c" class="form-label">Option C: (Optional)</label>
                            <input type="text" id="option_c" name="option_c" class="form-control">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="option_d" class="form-label">Option D: (Optional)</label>
                            <input type="text" id="option_d" name="option_d" class="form-control">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="correct_option" class="form-label">Correct Option:</label>
                        <select id="correct_option" name="correct_option" class="form-select" required>
                            <option value="">Select Correct Answer</option>
                            <option value="a">A</option>
                            <option value="b">B</option>
                            <option value="c">C</option>
                            <option value="d">D</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-success">Add Question</button>
                </form>
            </div>
        `;
        // Attach event listener to the newly created form
        const addQuestionForm = document.getElementById('add-question-to-quiz-form');
        if (addQuestionForm) {
            addQuestionForm.addEventListener('submit', handleAddQuestionFormSubmit);
        }
    }

    // --- 5. Fetch and Display Quiz Questions ---
    async function fetchAndDisplayQuizQuestions(quizId) {
        const currentQuizQuestionsListDiv = document.getElementById('current-quiz-questions-list');
        if (!currentQuizQuestionsListDiv) return; // In case the UI wasn't built yet

        try {
            const response = await fetch(`${apiUrl}backend/teacher/get_quiz_questions.php?quiz_id=${quizId}`);
            const responseData = await response.json();
            currentQuizQuestionsListDiv.innerHTML = ''; // Clear

            if (responseData.status === 0 && responseData.questions.length > 0) {
                responseData.questions.forEach(q => {
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'list-group-item question-item';
                    questionDiv.innerHTML = `
                        <p class="mb-1"><strong>Q:</strong> ${q.question_text}</p>
                        <small class="d-block">A: ${q.option_a} | B: ${q.option_b} ${q.option_c ? '| C: '+q.option_c : ''} ${q.option_d ? '| D: '+q.option_d : ''}</small>
                        <small class="d-block"><strong>Correct: ${q.correct_option.toUpperCase()}</strong></small>
                        <!-- Future: Edit/Delete buttons here -->
                    `;
                    currentQuizQuestionsListDiv.appendChild(questionDiv);
                });
            } else if (responseData.status === 0) {
                currentQuizQuestionsListDiv.innerHTML = '<p>No questions found for this quiz yet.</p>';
            } else {
                currentQuizQuestionsListDiv.innerHTML = `<p class="text-danger">${responseData.message || 'Error fetching questions.'}</p>`;
            }
        } catch (error) {
            console.error('Error fetching quiz questions:', error);
            currentQuizQuestionsListDiv.innerHTML = `<p class="text-danger">Could not connect to server: ${error.message}</p>`;
        }
    }

    // --- 6. Handle "Add New Question to This Quiz" Form Submit ---
    async function handleAddQuestionFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const quizId = document.getElementById('current_quiz_id_for_new_question').value; // or use currentSelectedQuizId

        const question_text = form.question_text.value.trim();
        const option_a = form.option_a.value.trim();
        const option_b = form.option_b.value.trim();
        const option_c = form.option_c.value.trim();
        const option_d = form.option_d.value.trim();
        const correct_option = form.correct_option.value;

        if (!question_text || !option_a || !option_b || !correct_option) {
            swal('Validation Error', 'Question text, options A, B, and correct option are required.', 'error');
            return;
        }
        if (correct_option === 'c' && !option_c) {
            swal('Validation Error', 'Option C cannot be empty if it is the correct answer.', 'error');
            return;
        }
        if (correct_option === 'd' && !option_d) {
            swal('Validation Error', 'Option D cannot be empty if it is the correct answer.', 'error');
            return;
        }


        const payload = {
            quiz_id: quizId,
            question_text, option_a, option_b, option_c, option_d, correct_option
        };

        try {
            const response = await fetch(`${apiUrl}backend/teacher/add_quiz_question.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const responseData = await response.json();

            if (responseData.status === 0) {
                swal('Success', responseData.message, 'success');
                form.reset();
                fetchAndDisplayQuizQuestions(quizId); // Refresh question list
            } else {
                swal('Error', responseData.message || 'Could not add question.', 'error');
            }
        } catch (error) {
            console.error('Error adding question:', error);
            swal('Request Failed', `Could not connect to server: ${error.message}`, 'error');
        }
    }
});
