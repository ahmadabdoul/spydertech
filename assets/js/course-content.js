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
    courseContents = resData.course_contents;

    $('#title').html(resData.course_details.title);
    $('#description').html(courseContents[0].description);

    if (!localStorage.getItem('progress')) {
      localStorage.setItem('progress', JSON.stringify([]));
    }else{
      localStorage.setItem('currentVideo', JSON.stringify({ course: id, videoId: courseContents[0].id }));

    }
    const progressArray = JSON.parse(localStorage.getItem('progress'));

    const lessonList = document.querySelector('.list-group');
    lessonList.innerHTML = ''; // Clear existing content

    let lastVideoId = null;
    let lastVideoDuration = 0;

    if (progressArray.length > 0) {
      const lastVideoProgress = progressArray.find((progress) => progress.course === id);

      if (lastVideoProgress) {
        lastVideoId = lastVideoProgress.videoId;
        lastVideoDuration = lastVideoProgress.duration || 0;
      }
    } else {
      localStorage.setItem('currentVideo', JSON.stringify({ course: id, videoId: courseContents[0].id }));
    }

    courseContents.forEach((content) => {
      const listItem = document.createElement('li');
      listItem.textContent = content.title;
      listItem.classList.add('list-group-item');

      if (content.id === lastVideoId) {
        listItem.classList.add('watched');
      }

      listItem.addEventListener('click', () => {
        const videoPlayer = document.querySelector('video');
        $('#description').html(content.description);

        if (content.video_type == 'url') {
          videoPlayer.src = content.video_url;
        } else {
          videoPlayer.src = `${url}${content.video_url}`;
        }

        const currentVideo = { course: id, videoId: content.id };
        localStorage.setItem('currentVideo', JSON.stringify(currentVideo));

        const progressIndex = progressArray.findIndex(
          (progress) =>
            progress.course === id && progress.videoId === content.id
        );

        if (progressIndex !== -1) {
          const progressData = progressArray[progressIndex];
          videoPlayer.currentTime = progressData.duration || 0;
        } else {
          progressArray.push({
            course: id,
            videoId: content.id,
            duration: lastVideoDuration,
          });
          localStorage.setItem('progress', JSON.stringify(progressArray));
        }
      });

      lessonList.appendChild(listItem);
    });

    const videoPlayer = document.querySelector('video');
    if (courseContents[0].video_type == 'url') {
      videoPlayer.src = courseContents[0].video_url;
    } else {
      videoPlayer.src = `${url}${courseContents[0].video_url}`;
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
