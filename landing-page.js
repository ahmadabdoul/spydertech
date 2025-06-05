document.addEventListener('DOMContentLoaded', function() {
    const storedUrl = localStorage.getItem('url');
    // Assuming backend is one level up from 'student' or 'teacher' if storedUrl is like 'http://.../lms/student/'
    // If storedUrl is 'http://.../lms/', then backend is directly 'backend/'.
    // For a landing page at root, if storedUrl is the base URL of the app (e.g. http://localhost/lms/),
    // then backend path is 'backend/'. If storedUrl is empty, it implies relative paths.
    const apiUrlBase = storedUrl ? storedUrl : ''; // Adjust if storedUrl includes subdirectories not relevant here

    async function fetchAndDisplayFeaturedCourses() {
        const container = document.getElementById('featured-courses-container');
        if (!container) {
            console.error('Error: Featured courses container not found.');
            return;
        }

        container.innerHTML = '<p class="text-center">Loading featured courses...</p>';

        try {
            // Construct the path assuming 'backend' is a top-level folder relative to the base URL or document root.
            const fetchURL = `${apiUrlBase}backend/get_featured_courses.php`;
            const response = await fetch(fetchURL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            container.innerHTML = ''; // Clear loading message

            if (responseData.status === 0 && responseData.courses && responseData.courses.length > 0) {
                responseData.courses.forEach(course => {
                    const courseCardCol = document.createElement('div');
                    courseCardCol.className = 'col-md-6 col-lg-4 mb-4 d-flex align-items-stretch'; // Added d-flex for equal height cards

                    const card = document.createElement('div');
                    card.className = 'card h-100 shadow-sm'; // h-100 for equal height effect with d-flex on parent

                    const imgPlaceholder = document.createElement('div');
                    imgPlaceholder.className = 'card-img-top featured-course-img-placeholder'; // Re-use class from CSS
                    imgPlaceholder.style.height = '180px';
                    imgPlaceholder.style.backgroundColor = '#e9ecef'; // from CSS
                    imgPlaceholder.style.display = 'flex';
                    imgPlaceholder.style.alignItems = 'center';
                    imgPlaceholder.style.justifyContent = 'center';
                    imgPlaceholder.style.fontStyle = 'italic';
                    imgPlaceholder.style.color = '#6c757d'; // from CSS
                    imgPlaceholder.textContent = 'Course Image'; // More descriptive than "Image Placeholder"
                    card.appendChild(imgPlaceholder);

                    const cardBody = document.createElement('div');
                    cardBody.className = 'card-body d-flex flex-column';

                    const title = document.createElement('h5');
                    title.className = 'card-title';
                    title.textContent = course.title;
                    cardBody.appendChild(title);

                    const description = document.createElement('p');
                    description.className = 'card-text flex-grow-1 fs-6'; // fs-6 for smaller text
                    description.textContent = course.description.length > 100 ?
                                              course.description.substring(0, 100) + '...' :
                                              course.description;
                    cardBody.appendChild(description);

                    // Ensure course.course_id is used for the link as per backend script alias
                    const learnMoreLink = document.createElement('a');
                    learnMoreLink.href = `student/course-content.html?courseId=${course.course_id}`; // Assuming courseId for query param
                    learnMoreLink.className = 'btn btn-primary mt-auto align-self-start'; // align-self-start for button at bottom left
                    learnMoreLink.textContent = 'Learn More';
                    cardBody.appendChild(learnMoreLink);

                    card.appendChild(cardBody);
                    courseCardCol.appendChild(card);
                    container.appendChild(courseCardCol);
                });
            } else {
                container.innerHTML = '<p class="text-center">No featured courses available at the moment. Check back soon!</p>';
            }
        } catch (error) {
            console.error('Error fetching featured courses:', error);
            container.innerHTML = '<p class="text-center text-danger">Could not load featured courses. Please try again later.</p>';
        }
    }

    // Call the function to display featured courses
    fetchAndDisplayFeaturedCourses();

    // Smooth scroll for navbar links (moved from inline script in index.html for cleanliness)
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust scroll position to account for fixed navbar height
                const navbarHeight = document.querySelector('.navbar.fixed-top')?.offsetHeight || 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
