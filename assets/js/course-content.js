const url = localStorage.getItem('url');
const user = JSON.parse(sessionStorage.getItem('user'));
const user_id = user.id;
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('course');
let courseContents = [];
let questionAnswers = [];

async function getCourseContent() {
  try {
    const response = await fetch(`${url}student/get-course-content.php?courseId=${id}`);
    const resData = await response.json();
    courseContents = resData.course_contents; // Assuming this is an array

    // General page setup
    $('#title').html(resData.course_details.title);
    const videoPlayer = document.querySelector('video');
    const descriptionElement = document.getElementById('description');

    // Setup progress tracking
    if (!localStorage.getItem('progress')) {
      localStorage.setItem('progress', JSON.stringify([]));
    }
    const progressArray = JSON.parse(localStorage.getItem('progress'));

    // Set initial currentVideo if courseContents exist, needed for progress tracking
    if (courseContents && courseContents.length > 0) {
        // Check if there's a last played video for this course in progressArray
        const lastPlayedVideoForCourse = progressArray.find(p => p.course === id && p.isLastPlayed); // Requires isLastPlayed flag
        if (lastPlayedVideoForCourse) {
             localStorage.setItem('currentVideo', JSON.stringify({ course: id, videoId: lastPlayedVideoForCourse.videoId }));
        } else {
            localStorage.setItem('currentVideo', JSON.stringify({ course: id, videoId: courseContents[0].id }));
        }
    }


    const chaptersContainer = document.getElementById('chapters-container');
    chaptersContainer.innerHTML = ''; // Clear existing content

    let currentChapterTitle = null;
    let chapterContentUl = null;

    if (courseContents && courseContents.length > 0) {
      courseContents.forEach((contentItem) => {
        if (contentItem.chapter_title !== currentChapterTitle) {
          currentChapterTitle = contentItem.chapter_title;

          const chapterTitleElement = document.createElement('h5');
          chapterTitleElement.textContent = currentChapterTitle;
          chapterTitleElement.classList.add('mt-4', 'mb-2');
          chaptersContainer.appendChild(chapterTitleElement);

          chapterContentUl = document.createElement('ul');
          chapterContentUl.classList.add('list-group', 'mb-3');
          chaptersContainer.appendChild(chapterContentUl);
        }

        const listItem = document.createElement('li');
        listItem.textContent = contentItem.title;
        listItem.classList.add('list-group-item');
        listItem.style.cursor = 'pointer'; // Make it look clickable

        // Check for watched status (optional, based on existing logic)
        const progressDataForThisItem = progressArray.find(p => p.course === id && p.videoId === contentItem.id);
        if (progressDataForThisItem && progressDataForThisItem.duration >= videoPlayer.duration -1 ) { // check if video is fully watched
             // listItem.classList.add('watched'); // Add a class if needed
        }


        listItem.addEventListener('click', () => {
          // Clear previous content
          descriptionElement.innerHTML = '';
          videoPlayer.style.display = 'none';
          videoPlayer.src = '';

          // Display text content
          if (contentItem.content && contentItem.content.trim() !== '') {
            descriptionElement.innerHTML = contentItem.content;
          }

          // Display video content
          if (contentItem.video_url && contentItem.video_url.trim() !== '') {
            if (contentItem.video_type === 'url') {
              videoPlayer.src = contentItem.video_url;
            } else {
              videoPlayer.src = `${url}${contentItem.video_url}`;
            }
            videoPlayer.style.display = 'block';
          }

          const currentVideo = { course: id, videoId: contentItem.id };
          localStorage.setItem('currentVideo', JSON.stringify(currentVideo));

          // Handle progress loading
          const progressIndex = progressArray.findIndex(
            (progress) =>
              progress.course === id && progress.videoId === contentItem.id
          );

          if (progressIndex !== -1) {
            const progressData = progressArray[progressIndex];
            videoPlayer.currentTime = progressData.duration || 0;
          } else {
            // Add new entry if it doesn't exist, though timeupdate will handle ongoing progress
            progressArray.push({
              course: id,
              videoId: contentItem.id,
              duration: 0,
            });
            localStorage.setItem('progress', JSON.stringify(progressArray));
          }
          videoPlayer.play(); // Start playing the selected video
        });

        if (chapterContentUl) {
          chapterContentUl.appendChild(listItem);
        }
      });

      // Initial content display (first item)
      const firstContentItem = courseContents[0];
      descriptionElement.innerHTML = ''; // Clear description
      videoPlayer.style.display = 'none'; // Hide video player initially
      videoPlayer.src = '';


      if (firstContentItem.content && firstContentItem.content.trim() !== '') {
        descriptionElement.innerHTML = firstContentItem.content;
      }
      if (firstContentItem.video_url && firstContentItem.video_url.trim() !== '') {
        if (firstContentItem.video_type === 'url') {
          videoPlayer.src = firstContentItem.video_url;
        } else {
          videoPlayer.src = `${url}${firstContentItem.video_url}`;
        }
        videoPlayer.style.display = 'block';
         // Load progress for the first video if available
        const firstVideoProgress = progressArray.find(p => p.course === id && p.videoId === firstContentItem.id);
        if (firstVideoProgress) {
            videoPlayer.currentTime = firstVideoProgress.duration || 0;
        }
      }
      // currentVideo localStorage already set above or defaults to first item
    } else {
      // Handle case where there are no course contents
      chaptersContainer.innerHTML = '<p>No content available for this course yet.</p>';
      descriptionElement.innerHTML = '';
      videoPlayer.style.display = 'none';
    }

    videoPlayer.addEventListener('timeupdate', () => {
      const currentVideo = JSON.parse(localStorage.getItem('currentVideo'));
      const progressIndex = progressArray.findIndex(
        (progress) =>
          progress.course === currentVideo.course &&
          progress.videoId === currentVideo.videoId
      );
      if (progressIndex !== -1) {
        const progressData = progressArray[progressIndex];
        progressData.duration = videoPlayer.currentTime;
        localStorage.setItem('progress', JSON.stringify(progressArray));
      }
    });

    videoPlayer.addEventListener('ended', () => {
      const currentVideo = JSON.parse(localStorage.getItem('currentVideo'));
      const progressIndex = progressArray.findIndex(
        (progress) =>
          progress.course === currentVideo.course &&
          progress.videoId === currentVideo.videoId
      );
      if (progressIndex !== -1) {
        const progressData = progressArray[progressIndex];
        progressData.duration = videoPlayer.duration;
        localStorage.setItem('progress', JSON.stringify(progressArray));
        checkCourseCompletion(progressArray); // Check if the course has been completed
        course_completed(); // Call the course_completed function
      }
    });

    questionAnswers = resData.questions_answers || [];

    const container = document.querySelector('.col-lg-4 .mb-4');
    container.innerHTML = ''; // Clear existing content

    if (questionAnswers.length > 0) {
      const title = document.createElement('h4');
      title.textContent = 'Questions and Answers';
      container.appendChild(title);

      questionAnswers.forEach((qa, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        if (index > 0) {
          card.classList.add('mt-3');
        }

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const questionTitle = document.createElement('h6');
        questionTitle.classList.add('card-title');
        questionTitle.textContent = qa.question;

        const answerText = document.createElement('p');
        answerText.classList.add('card-text');
        answerText.textContent = qa.answer;

        cardBody.appendChild(questionTitle);
        cardBody.appendChild(answerText);
        card.appendChild(cardBody);
        container.appendChild(card);
      });
    } else {
      container.innerHTML = '<p>No questions and answers found for the course.</p>';
    }

    checkCourseCompletion(progressArray); // Check if the course has been completed
  } catch (error) {
    console.log(error);
  }
}

function course_completed() {
  const requestBody = {
    courseId: id,
    user_id: user_id,
  };

  fetch(`${url}student/course-completion.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log('Course completion:', responseData);
    })
    .catch((error) => {
      console.log('Error completing course:', error);
    });
}

function checkCourseCompletion(progressArray) {
  // Check if all video contents have been watched
  const isCourseCompleted = courseContents.every((content) => {
    const progressData = progressArray.find(
      (progress) => progress.course === id && progress.videoId === content.id
    );
    return progressData && progressData.duration > 0;
  });

  if (isCourseCompleted) {
    course_completed(); // Call the course_completed function
  }
}

showloader();
getCourseContent()
  .then(() => {
    hideloader();
  })
  .catch((error) => {
    console.log(error);
    hideloader();
  });

// Event listener for submitQuestionBtn
const submitQuestionBtn = document.getElementById('submitQuestionBtn');
submitQuestionBtn.addEventListener('click', () => {
  const questionTextarea = document.getElementById('questionTextarea');
  const question = questionTextarea.value;

  // Update question_answers array with the new question
  const newQuestionAnswer = {
    question,
    answer: '',
    course_id: id,
    user_id: user_id,
  };
  questionAnswers.push(newQuestionAnswer);
  console.log(questionAnswers);

  // Send fetch request to update the question
  const requestBody = {
    courseId: id,
    user_id: user_id,
    question,
  };

  fetch(`${url}student/submit-question.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
    .then((response) => response.json())
    .then((responseData) => {
      swal(
        'Success',
        `Question submitted successfully: ${responseData.message}`,
        'success'
      );
    })
    .catch((error) => {
      swal('Oops', `Error submitting question: ${error}`, error);
    });

  // Clear the question input
  questionTextarea.value = '';
});
