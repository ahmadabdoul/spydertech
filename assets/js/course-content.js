// --- Global State Variables ---
const APP_URL = localStorage.getItem('url') || '';
const LOGGED_IN_USER = JSON.parse(sessionStorage.getItem('user'));
const USER_ID = LOGGED_IN_USER ? LOGGED_IN_USER.id : null;
const URL_PARAMS = new URLSearchParams(window.location.search);
const COURSE_ID = URL_PARAMS.get('course');

// Initialize from pre-loaded PHP data
const { course_details, course_contents, chapters: phpChapters } = window.PHP_DATA || {};
let allCourseContents = course_contents || [];
let courseDetails = course_details || null;
let chapters = phpChapters || [];

let currentChapterIndex = 0;
let currentContentItems = [];
let userCourseProgress = {}; // { content_id: { completed: bool, lastPosition: string, type: string } }
let currentCourseEnrollmentStatus = '';

// --- DOM Element References ---
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

// --- Helper Functions ---
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// --- Core Logic ---
async function initializeCoursePage() {
    if (!COURSE_ID || !USER_ID) {
        if(contentItemsContainerEl) contentItemsContainerEl.innerHTML = "<p class='text-danger'>User or Course ID not found. Please log in and select a course.</p>";
        if(certificateSectionEl) certificateSectionEl.style.display = 'none';
        return;
    }

    if (!allCourseContents || !courseDetails) {
        console.error("Course data not pre-loaded from PHP.");
        if(contentItemsContainerEl) contentItemsContainerEl.innerHTML = "<p class='text-danger'>Could not load course data.</p>";
        return;
    }

    // Fetch user-specific progress
    try {
        const progressResponse = await fetch(`${APP_URL}student/get_course_progress.php?student_id=${USER_ID}&course_id=${COURSE_ID}`);
        if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            if (progressData.status === 0 && progressData.progress) {
                progressData.progress.forEach(p => {
                    userCourseProgress[p.content_id] = {
                        completed: p.completed_status,
                        lastPosition: p.last_position,
                    };
                });
            }
        } else {
           console.warn(`HTTP error fetching progress! status: ${progressResponse.status}`);
        }
    } catch (error) {
        console.error("Error fetching course progress:", error);
    }

    // Add event listeners to dynamically generated elements
    setupEventListeners();

    // Set initial visual state based on fetched progress
    updateAllVisuals();
}

function setupEventListeners() {
    // Chapter selection from sidebar
    document.querySelectorAll('#chapter-sidebar-list .list-group-item-action').forEach(li => {
        li.addEventListener('click', () => {
            const chapterIndex = parseInt(li.dataset.chapterIndex, 10);
            displayChapter(chapterIndex);
        });
    });

    // Chapter navigation buttons
    if (prevChapterBtnEl) {
        prevChapterBtnEl.addEventListener('click', () => {
            if (currentChapterIndex > 0) displayChapter(currentChapterIndex - 1);
        });
    }
    if (nextChapterBtnEl) {
        nextChapterBtnEl.addEventListener('click', () => {
            if (currentChapterIndex < chapters.length - 1) displayChapter(currentChapterIndex + 1);
        });
    }

    // Video player listeners
    if (videoPlayerEl) {
        videoPlayerEl.addEventListener('timeupdate', handleVideoTimeUpdate);
        videoPlayerEl.addEventListener('ended', handleVideoEnded);
    }

    // Q&A submission form
    const submitQuestionBtn = document.getElementById('submitQuestionBtn');
    if (submitQuestionBtn) {
        submitQuestionBtn.addEventListener('click', submitQuestion);
    }
}

function updateAllVisuals() {
    allCourseContents.forEach(item => {
        const progress = userCourseProgress[item.id];
        if (progress) {
            markListItemAsCompletedVisuals(item.id, progress.completed);
        }
    });

    const initialProgress = calculateOverallCourseProgress();
    checkAndDisplayCertificateButton(initialProgress);
}

function displayChapter(chapterIndex) {
    if (chapterIndex < 0 || chapterIndex >= chapters.length) return;
    currentChapterIndex = chapterIndex;
    const selectedChapterTitle = chapters[currentChapterIndex];

    if (currentChapterDisplayEl) currentChapterDisplayEl.textContent = selectedChapterTitle;
    if (selectedChapterContentTitleEl) selectedChapterContentTitleEl.textContent = `Content for: ${selectedChapterTitle}`;

    document.querySelectorAll('#chapter-sidebar-list .list-group-item-action').forEach((li, idx) => {
        li.classList.toggle('active', idx === currentChapterIndex);
    });

    currentContentItems = allCourseContents.filter(item => item.chapter_title && item.chapter_title.trim() === selectedChapterTitle);
    populateContentItemsList(currentContentItems);

    if (currentContentItems.length > 0) {
        displayContentItem(currentContentItems[0]);
    } else {
        if (descriptionEl) descriptionEl.innerHTML = '<p>No content items in this chapter.</p>';
        if (videoPlayerEl) { videoPlayerEl.style.display = 'none'; videoPlayerEl.src = ''; }
        if (contentItemsContainerEl) contentItemsContainerEl.innerHTML = '<p class="list-group-item">This chapter has no content items yet.</p>';
    }

    if (prevChapterBtnEl) prevChapterBtnEl.disabled = currentChapterIndex === 0;
    if (nextChapterBtnEl) nextChapterBtnEl.disabled = currentChapterIndex >= chapters.length - 1;
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
        descriptionEl.clearCustomScrollListener = () => descriptionEl.removeEventListener('scroll', scrollHandler);
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
            if (responseData.status !== 0) {
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
        } else {
            listItem.classList.remove('content-item-completed');
        }
    }
}

function calculateOverallCourseProgress() {
    if (!allCourseContents || allCourseContents.length === 0) {
        if(courseProgressTextEl) courseProgressTextEl.textContent = 'Overall Progress: 0%';
        checkAndDisplayCertificateButton(0);
        return 0;
    }
    const completedItemsCount = allCourseContents.filter(item => {
        const progress = userCourseProgress[item.id];
        return progress && progress.completed;
    }).length;

    const overallProgressPercentage = (completedItemsCount / allCourseContents.length) * 100;
    if(courseProgressTextEl) courseProgressTextEl.textContent = `Overall Progress: ${overallProgressPercentage.toFixed(0)}%`;

    checkAndDisplayCertificateButton(overallProgressPercentage);
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
            certificateFeeDisplayEl.textContent = fee > 0 ? `(Fee: $${fee.toFixed(2)})` : '(Free)';
            getCertificateBtnEl.classList.remove('disabled');
            certificateSectionEl.style.display = 'block';
        };

        if (currentCourseEnrollmentStatus !== 'Completed') {
            course_completed().then(success => {
                if(success) currentCourseEnrollmentStatus = 'Completed';
                configureAndShow();
            }).catch(error => {
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

function handleVideoTimeUpdate() {
    const currentVideoData = JSON.parse(localStorage.getItem('currentVideo'));
    if (!currentVideoData || !videoPlayerEl || !videoPlayerEl.duration) return;
    updateAndPersistContentProgress(currentVideoData.videoId, 'video', videoPlayerEl.currentTime, false, videoPlayerEl.duration);
}

function handleVideoEnded() {
    const currentVideoData = JSON.parse(localStorage.getItem('currentVideo'));
    if (!currentVideoData || !videoPlayerEl || !videoPlayerEl.duration) return;
    updateAndPersistContentProgress(currentVideoData.videoId, 'video', videoPlayerEl.duration, true, videoPlayerEl.duration);
}

async function course_completed() {
    const requestBody = { courseId: COURSE_ID, user_id: USER_ID };
    try {
        const response = await fetch(`${APP_URL}student/course-completion.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            console.error('Course completion API call failed with status:', response.status);
            return false;
        }
        const responseData = await response.json();
        return responseData.status === 0;
    } catch (error) {
        console.error('Network or other error in course_completed:', error);
        return false;
    }
}

function submitQuestion() {
    const questionTextarea = document.getElementById('questionTextarea');
    const question = questionTextarea.value.trim();
    if (!question) {
        swal('Empty Question', 'Please type your question before submitting.', 'warning');
        return;
    }
    const requestBody = { courseId: COURSE_ID, user_id: USER_ID, question };

    fetch(`${APP_URL}student/submit-question.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    })
    .then((response) => response.json())
    .then((responseData) => {
        if (responseData.status === 0) {
            swal('Success', 'Question submitted successfully. It will be reviewed by the instructor.', 'success');
            questionTextarea.value = '';
            // Optionally, dynamically add the new question to the UI. For now, a refresh would show it.
        } else {
            swal('Submission Error', `Failed to submit question: ${responseData.message}`, 'error');
        }
    })
    .catch((error) => {
        swal('Request Error', `Error submitting question: ${error}`, 'error');
    });
}

// --- Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    showloader();
    initializeCoursePage()
      .then(() => hideloader())
      .catch((error) => {
        console.error("Failed to initialize course content page:", error);
        hideloader();
        if(contentItemsContainerEl) contentItemsContainerEl.innerHTML = "<p class='text-danger'>A critical error occurred while initializing the page.</p>";
      });
});