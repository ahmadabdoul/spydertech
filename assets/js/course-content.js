// Global state variables
const APP_URL = localStorage.getItem('url') || ''; // Base URL for the application
const LOGGED_IN_USER = JSON.parse(sessionStorage.getItem('user'));
const USER_ID = LOGGED_IN_USER ? LOGGED_IN_USER.id : null;
const URL_PARAMS = new URLSearchParams(window.location.search);
const COURSE_ID = URL_PARAMS.get('course'); // This is the global course ID

let allCourseContents = []; // To store all fetched content items for the course
let courseDetails = null; // To store course-specific details like certificate_fee
let chapters = []; // Array of unique chapter titles
let currentChapterIndex = 0; // Index of the currently displayed chapter
let currentContentItems = []; // Content items of the currently displayed chapter
let userCourseProgress = {}; // Stores { content_id: { completed: bool, lastPosition: string, type: string } }
let currentCourseEnrollmentStatus = ''; // Stores current enrollment/completion status for this course

// DOM Element References
const courseTitleEl = document.getElementById('title');
const currentChapterDisplayEl = document.getElementById('current-chapter-display');
const chapterSidebarListEl = document.getElementById('chapter-sidebar-list');
const prevChapterBtnEl = document.getElementById('prev-chapter-btn');
const nextChapterBtnEl = document.getElementById('next-chapter-btn');
const videoPlayerEl = document.querySelector('#content-item-display-area video');
const descriptionEl = document.getElementById('description');
const selectedChapterContentTitleEl = document.getElementById('selected-chapter-content-title');
const contentItemsContainerEl = document.getElementById('chapters-container');

const certificateSectionEl = document.getElementById('certificate-section');
const getCertificateBtnEl = document.getElementById('get-certificate-btn');
const certificateFeeDisplayEl = document.getElementById('certificate-fee-display');
const courseProgressTextEl = document.getElementById('course-progress-text');


// Debounce function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// --- Core Logic ---
async function getCourseContent() {
  if (!COURSE_ID) {
    if(contentItemsContainerEl) contentItemsContainerEl.innerHTML = "<p class='text-danger'>Course ID not found in URL.</p>";
    if(certificateSectionEl) certificateSectionEl.style.display = 'none';
    return;
  }
  if (!USER_ID) {
    if(contentItemsContainerEl) contentItemsContainerEl.innerHTML = "<p class='text-danger'>User not logged in.</p>";
    if(certificateSectionEl) certificateSectionEl.style.display = 'none';
    return;
  }

  try {
    // Fetch main course content
    const contentResponse = await fetch(`${APP_URL}student/get-course-content.php?courseId=${COURSE_ID}`);
    if (!contentResponse.ok) throw new Error(`HTTP error fetching content! status: ${contentResponse.status}`);
    const contentData = await contentResponse.json();
    if (contentData.status !== 0 || !contentData.course_contents) {
        throw new Error(contentData.message || 'Failed to fetch course content.');
    }
    const allCourseContents = contentData.course_contents;
    console.log(allCourseContents)
    courseDetails = contentData.course_details; // Store course details, should include certificate_fee

    // Fetch course progress
    try {
        const progressResponse = await fetch(`${APP_URL}student/get_course_progress.php?student_id=${USER_ID}&course_id=${COURSE_ID}`);
        if (!progressResponse.ok) console.warn(`HTTP error fetching progress! status: ${progressResponse.status}`);
        else {
            const progressData = await progressResponse.json();
            if (progressData.status === 0 && progressData.progress) {
                progressData.progress.forEach(p => {
                    userCourseProgress[p.content_id] = {
                        completed: p.completed_status,
                        lastPosition: p.last_position,
                        // type: p.type // Assuming backend might send type, otherwise infer in update function
                    };
                });
            } else if (progressData.status !== 0) {
                console.warn("Could not fetch course progress:", progressData.message);
            }
        }
    } catch (error) {
        console.error("Error fetching course progress:", error);
    }

    if (courseTitleEl && courseDetails) {
        courseTitleEl.textContent = courseDetails.title;
    }

    const chapterTitlesSet = new Set();
    if (allCourseContents && allCourseContents.length > 0) {
        allCourseContents.forEach(item => {
            if(item.title) chapterTitlesSet.add(item.title.trim());
        });
        chapters = Array.from(chapterTitlesSet).filter(title => title);
    }

    populateChapterSidebar();
    loadQuestionAnswers(contentData.questions_answers || []);

    if (chapters.length > 0) {
      displayChapter(0);
    } else {
      if(chapterSidebarListEl) chapterSidebarListEl.innerHTML = '<li class="list-group-item">No chapters available.</li>';
      if(contentItemsContainerEl) contentItemsContainerEl.innerHTML = '<p>This course has no content organized into chapters yet.</p>';
      if(selectedChapterContentTitleEl) selectedChapterContentTitleEl.textContent = 'No Content';
      if(currentChapterDisplayEl) currentChapterDisplayEl.textContent = 'N/A';
      if(prevChapterBtnEl) prevChapterBtnEl.disabled = true;
      if(nextChapterBtnEl) nextChapterBtnEl.disabled = true;
      if(certificateSectionEl) certificateSectionEl.style.display = 'none';
    }

    if(videoPlayerEl){
        videoPlayerEl.addEventListener('timeupdate', handleVideoTimeUpdate);
        videoPlayerEl.addEventListener('ended', handleVideoEnded);
    }
    const initialProgress = calculateOverallCourseProgress();
    checkAndDisplayCertificateButton(initialProgress);

  } catch (error) {
    console.error('Error in getCourseContent:', error);
    if(contentItemsContainerEl) contentItemsContainerEl.innerHTML = `<p class="text-danger">Could not load course content: ${error.message}</p>`;
    if(certificateSectionEl) certificateSectionEl.style.display = 'none';
  }
}

function populateChapterSidebar() {
    if (!chapterSidebarListEl) return;
    chapterSidebarListEl.innerHTML = '';
    if (chapters.length === 0) {
        chapterSidebarListEl.innerHTML = '<li class="list-group-item">No chapters defined.</li>';
        return;
    }
    chapters.forEach((chapterTitle, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action';
        li.style.cursor = 'pointer';
        li.textContent = chapterTitle;
        li.dataset.chapterIndex = index;
        li.addEventListener('click', () => displayChapter(index));
        chapterSidebarListEl.appendChild(li);
    });
}

function displayChapter(chapterIndex) {
  if (chapterIndex < 0 || chapterIndex >= chapters.length) return;
  currentChapterIndex = chapterIndex;
  const selectedChapterTitle = chapters[currentChapterIndex];

  if(currentChapterDisplayEl) currentChapterDisplayEl.textContent = selectedChapterTitle;
  if(selectedChapterContentTitleEl) selectedChapterContentTitleEl.textContent = `Content for: ${selectedChapterTitle}`;

  Array.from(chapterSidebarListEl.children).forEach((li, idx) => {
    li.classList.toggle('active', idx === currentChapterIndex);
  });

  currentContentItems = allCourseContents.filter(item => item.chapter_title && item.chapter_title.trim() === selectedChapterTitle);
  populateContentItemsList(currentContentItems);

  if (currentContentItems.length > 0) {
    displayContentItem(currentContentItems[0]);
  } else {
    if(descriptionEl) descriptionEl.innerHTML = '<p>No content items in this chapter.</p>';
    if(videoPlayerEl) { videoPlayerEl.style.display = 'none'; videoPlayerEl.src = ''; }
  }

  if(prevChapterBtnEl) prevChapterBtnEl.disabled = currentChapterIndex === 0;
  if(nextChapterBtnEl) nextChapterBtnEl.disabled = currentChapterIndex >= chapters.length - 1;
}

function populateContentItemsList(items) {
    if (!contentItemsContainerEl) return;
    contentItemsContainerEl.innerHTML = '';

    if (items.length === 0) {
        contentItemsContainerEl.innerHTML = '<p class="list-group-item">This chapter has no content items yet.</p>';
        return;
    }
    items.forEach(contentItem => {
        const a = document.createElement('a');
        a.className = 'list-group-item list-group-item-action';
        a.href = '#';
        a.textContent = contentItem.title;
        a.dataset.contentId = contentItem.id;
        a.addEventListener('click', (e) => { e.preventDefault(); displayContentItem(contentItem); });

        const progress = userCourseProgress[contentItem.id];
        markListItemAsCompletedVisuals(contentItem.id, progress ? progress.completed : false, a);
        contentItemsContainerEl.appendChild(a);
    });
}

function displayContentItem(contentItem) {
    if (!videoPlayerEl || !descriptionEl) return;

    descriptionEl.innerHTML = '';
    videoPlayerEl.style.display = 'none';
    videoPlayerEl.pause();
    videoPlayerEl.src = '';
    if(descriptionEl.clearCustomScrollListener) descriptionEl.clearCustomScrollListener();

    const itemProgress = userCourseProgress[contentItem.id];

    if (contentItem.content && contentItem.content.trim() !== '') {
        descriptionEl.innerHTML = contentItem.content;
        descriptionEl.scrollTop = 0;
        if (itemProgress && itemProgress.type === 'text' && itemProgress.lastPosition) {
            const scrollPercent = parseFloat(String(itemProgress.lastPosition).replace('%', ''));
            if (!isNaN(scrollPercent) && descriptionEl.scrollHeight > descriptionEl.clientHeight) {
                 descriptionEl.scrollTop = (scrollPercent / 100) * (descriptionEl.scrollHeight - descriptionEl.clientHeight);
            }
        }
        const scrollHandler = debounce(() => handleTextScroll(contentItem.id, descriptionEl), 250);
        descriptionEl.addEventListener('scroll', scrollHandler);
        descriptionEl.clearCustomScrollListener = () => descriptionEl.removeEventListener('scroll', scrollHandler); // Store remover
        setTimeout(() => handleTextScroll(contentItem.id, descriptionEl), 0);
    } else {
        if (!contentItem.video_url || contentItem.video_url.trim() === '') {
             updateAndPersistContentProgress(contentItem.id, 'text', 100, true);
        }
    }

    if (contentItem.video_url && contentItem.video_url.trim() !== '') {
        videoPlayerEl.src = (contentItem.video_type === 'url') ? contentItem.video_url : `${APP_URL}${contentItem.video_url}`;
        videoPlayerEl.style.display = 'block';
        if (itemProgress && itemProgress.type === 'video' && itemProgress.lastPosition) {
            videoPlayerEl.currentTime = parseFloat(itemProgress.lastPosition) || 0;
        }
    } else {
        if (!contentItem.content || contentItem.content.trim() === '') {
            updateAndPersistContentProgress(contentItem.id, 'video', 0, true, 0);
        }
    }

    localStorage.setItem('currentVideo', JSON.stringify({ course: COURSE_ID, videoId: contentItem.id }));
    markListItemAsCompletedVisuals(contentItem.id, itemProgress ? itemProgress.completed : false);

    Array.from(contentItemsContainerEl.children).forEach(aNode => {
        aNode.classList.toggle('active', aNode.dataset.contentId == contentItem.id);
    });
}

async function updateAndPersistContentProgress(contentId, contentType, newPosition, isCompletedOverride = false, videoDuration = null) {
    let isCompleted = isCompletedOverride;
    let lastPositionString = String(newPosition);

    if (!isCompletedOverride) {
        if (contentType === 'video' && videoDuration != null && videoDuration > 0) {
            isCompleted = (newPosition / videoDuration) * 100 >= 80;
            lastPositionString = newPosition.toFixed(2);
        } else if (contentType === 'video' && (videoDuration == null || videoDuration === 0)) {
            isCompleted = false;
            lastPositionString = "0.00";
        } else if (contentType === 'text') {
            isCompleted = newPosition >= 80;
            lastPositionString = `${Math.round(newPosition)}%`;
        }
    } else {
         if (contentType === 'video' && videoDuration !== null) lastPositionString = videoDuration.toFixed(2);
         else if (contentType === 'text') lastPositionString = '100%';
         else if (contentType === 'video' && videoDuration === null) lastPositionString = "0.00";
    }

    const existingProgress = userCourseProgress[contentId] || {};
    const newCompletedStatus = existingProgress.completed || isCompleted;

    const needsBackendUpdate = (!userCourseProgress[contentId] ||
                               userCourseProgress[contentId].completed !== newCompletedStatus ||
                               userCourseProgress[contentId].lastPosition !== lastPositionString);

    userCourseProgress[contentId] = {
        completed: newCompletedStatus,
        lastPosition: lastPositionString,
        type: contentType
    };

    if(newCompletedStatus) markListItemAsCompletedVisuals(contentId, true);
    else markListItemAsCompletedVisuals(contentId, false);

    const overallProgress = calculateOverallCourseProgress();
    checkAndDisplayCertificateButton(overallProgress);

    if (needsBackendUpdate) {
        try {
            const payload = {
                student_id: USER_ID,
                course_id: COURSE_ID,
                content_id: Number(contentId),
                completed_status: newCompletedStatus,
                last_position: lastPositionString
            };
            const response = await fetch(`${APP_URL}student/update_content_progress.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const responseData = await response.json();
            if (responseData.status === 0) {
                // console.log('Progress persisted for content_id:', contentId, responseData.action);
            } else {
                console.error('Failed to persist progress for content_id:', contentId, responseData.message);
            }
        } catch (error) {
            console.error('Error persisting progress for content_id:', contentId, error);
        }
    }
}

function handleTextScroll(contentItemId, element) {
    let scrollPercentage = 0;
    if (element.scrollHeight <= element.clientHeight) {
        scrollPercentage = 100;
    } else {
        scrollPercentage = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    }
    updateAndPersistContentProgress(contentItemId, 'text', Math.round(scrollPercentage), false);
}

function markListItemAsCompletedVisuals(contentItemId, isCompleted, element = null) {
    const listItem = element || document.querySelector(`#chapters-container [data-content-id='${contentItemId}']`);
    if (listItem) {
        if (isCompleted) {
            listItem.classList.add('content-item-completed');
            // CSS: .content-item-completed { background-color: #e6ffed; border-left: 4px solid #28a745; opacity: 0.7; }
            // CSS: .content-item-completed::after { content: ' ✔'; color: green; }
        } else {
            listItem.classList.remove('content-item-completed');
        }
    }
}

function calculateOverallCourseProgress() {
    if (!allCourseContents || allCourseContents.length === 0) {
        if(courseProgressTextEl) courseProgressTextEl.textContent = 'Overall Progress: 0%';
        checkAndDisplayCertificateButton(0); // Update certificate button status
        return 0;
    }

    const totalTrackableItems = allCourseContents.length;
    if (totalTrackableItems === 0) {
        if(courseProgressTextEl) courseProgressTextEl.textContent = 'Overall Progress: 0%';
        checkAndDisplayCertificateButton(0);
        return 0;
    }

    let completedItemsCount = 0;
    allCourseContents.forEach(item => {
        const progress = userCourseProgress[item.id];
        if (progress && progress.completed) {
            completedItemsCount++;
        }
    });

    const overallProgressPercentage = (completedItemsCount / totalTrackableItems) * 100;
    if(courseProgressTextEl) courseProgressTextEl.textContent = `Overall Progress: ${overallProgressPercentage.toFixed(0)}%`;

    checkAndDisplayCertificateButton(overallProgressPercentage); // Call here to update button status
    return overallProgressPercentage;
}

function checkAndDisplayCertificateButton(overallPercentage) {
    if (!certificateSectionEl || !getCertificateBtnEl || !certificateFeeDisplayEl || !courseDetails) {
        return;
    }

    if (overallPercentage >= 80) {
        const configureAndShow = () => {
            getCertificateBtnEl.href = `${APP_URL}student/generate_certificate.php?course_id=${COURSE_ID}&student_id=${USER_ID}`;
            const fee = parseFloat(courseDetails.certificate_fee);
            if (fee > 0) {
                certificateFeeDisplayEl.textContent = `(Fee: $${fee.toFixed(2)})`;
            } else {
                certificateFeeDisplayEl.textContent = '(Free)';
            }
            getCertificateBtnEl.classList.remove('disabled');
            certificateSectionEl.style.display = 'block';
        };

        if (currentCourseEnrollmentStatus !== 'Completed') {
            course_completed()
                .then(success => {
                    if(success) {
                        currentCourseEnrollmentStatus = 'Completed';
                    } else {
                        console.warn("Backend course completion update failed. Certificate generation might rely on backend check.");
                    }
                    configureAndShow();
                })
                .catch(error => {
                     console.error("Error calling course_completed:", error);
                     configureAndShow();
                });
        } else {
            configureAndShow();
        }
    } else {
        certificateSectionEl.style.display = 'none';
        getCertificateBtnEl.classList.add('disabled');
    }
}

// Event Listeners for Prev/Next Chapter Buttons
if(prevChapterBtnEl) {
    prevChapterBtnEl.addEventListener('click', () => {
      if (currentChapterIndex > 0) {
        displayChapter(currentChapterIndex - 1);
      }
    });
}
if(nextChapterBtnEl) {
    nextChapterBtnEl.addEventListener('click', () => {
      if (currentChapterIndex < chapters.length - 1) {
        displayChapter(currentChapterIndex + 1);
      }
    });
}

// Video Progress Handling Functions (Adapted)
function handleVideoTimeUpdate() {
    const currentVideoData = JSON.parse(localStorage.getItem('currentVideo'));
    if (!currentVideoData || !videoPlayerEl || !videoPlayerEl.duration || videoPlayerEl.duration === 0) return;
    updateAndPersistContentProgress(currentVideoData.videoId, 'video', videoPlayerEl.currentTime, false, videoPlayerEl.duration);
}

function handleVideoEnded() {
    const currentVideoData = JSON.parse(localStorage.getItem('currentVideo'));
    if (!currentVideoData || !videoPlayerEl || !videoPlayerEl.duration) return;
    updateAndPersistContentProgress(currentVideoData.videoId, 'video', videoPlayerEl.duration, true, videoPlayerEl.duration);
}

// Q&A and Course Completion logic
function loadQuestionAnswers(questionAnswersData) {
    let qnaTargetContainer = document.querySelector('.col-lg-4 > .card > .card-body > h4')?.parentElement || document.querySelector('.col-lg-4 .mb-4');
    if (!qnaTargetContainer && document.querySelector('.col-lg-4')) {
         qnaTargetContainer = document.querySelector('.col-lg-4').firstElementChild?.querySelector('.card-body') || document.querySelector('.col-lg-4 > .mb-4');
    }
    if (!qnaTargetContainer) { console.warn("Q&A container could not be reliably found."); return; }

    const qaListParentId = 'qa-list-dynamic-parent';
    let qaListParent = qnaTargetContainer.querySelector(`#${qaListParentId}`);

    if (!qaListParent) {
        qnaTargetContainer.innerHTML = '';
        const title = document.createElement('h4');
        title.textContent = 'Questions and Answers';
        qnaTargetContainer.appendChild(title);
        qaListParent = document.createElement('div');
        qaListParent.id = qaListParentId;
        qnaTargetContainer.appendChild(qaListParent);
    } else {
         qaListParent.innerHTML = '';
    }

    if (questionAnswersData.length > 0) {
      questionAnswersData.forEach((qa) => {
        const card = document.createElement('div');
        card.classList.add('card', 'mb-2');
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body', 'p-3');
        const questionTitle = document.createElement('h6');
        questionTitle.classList.add('card-title', 'mb-1');
        questionTitle.textContent = qa.question;
        const answerText = document.createElement('p');
        answerText.classList.add('card-text', 'fs-6');
        answerText.textContent = qa.answer || 'Awaiting answer...';
        cardBody.appendChild(questionTitle);
        cardBody.appendChild(answerText);
        card.appendChild(cardBody);
        qaListParent.appendChild(card);
      });
    } else {
      qaListParent.innerHTML = '<p>No questions and answers found for the course.</p>';
    }
}

async function course_completed() {
  console.log(`Attempting to mark course ${COURSE_ID} as completed on backend.`);
  const requestBody = {
    courseId: COURSE_ID,
    user_id: USER_ID,
  };

  try {
    const response = await fetch(`${APP_URL}student/course-completion.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
    if (!response.ok) {
        console.error('Course completion API call failed with status:', response.status);
        return false;
    }
    const responseData = await response.json();

    console.log('Course completion response:', responseData);
    if (responseData.status === 0) {
      currentCourseEnrollmentStatus = 'Completed';
      return true;
    }
    return false;
  } catch (error) {
      console.error('Network or other error in course_completed:', error);
      return false;
  }
}

function checkCourseCompletion() {
  calculateOverallCourseProgress();
}

showloader();
getCourseContent()
  .then(() => {
    hideloader();
  })
  .catch((error) => {
    console.error("Failed to initialize course content:", error);
    hideloader();
    if(contentItemsContainerEl) contentItemsContainerEl.innerHTML = "<p class='text-danger'>A critical error occurred while loading course data. Please try refreshing the page.</p>";
  });

// Event listener for submitQuestionBtn
const submitQuestionBtn = document.getElementById('submitQuestionBtn');
if (submitQuestionBtn) {
    submitQuestionBtn.addEventListener('click', () => {
      const questionTextarea = document.getElementById('questionTextarea');
      if (!questionTextarea) return;
      const question = questionTextarea.value.trim();
      if (!question) {
        swal('Empty Question', 'Please type your question before submitting.', 'warning');
        return;
      }
      const requestBody = {
        courseId: COURSE_ID,
        user_id: USER_ID,
        question,
      };

      fetch(`${APP_URL}student/submit-question.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => response.json())
        .then((responseData) => {
          if (responseData.status === 0) {
            swal(
              'Success',
              `Question submitted successfully: ${responseData.message}`,
              'success'
            );
            questionTextarea.value = '';
          } else {
            swal('Submission Error', `Failed to submit question: ${responseData.message}`, 'error');
          }
        })
        .catch((error) => {
          swal('Request Error', `Error submitting question: ${error}`, 'error');
        });
    });
}
