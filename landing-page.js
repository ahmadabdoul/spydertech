// Enhanced Landing Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Spydertech LMS Landing Page...');
    
    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic'
        });
        console.log('✅ AOS Animation library initialized');
    }

    const storedUrl = localStorage.getItem('url');
    const apiUrlBase = storedUrl ? storedUrl : '';

    // Initialize all functionality
    initNavbar();
    initSmoothScrolling();
    initBackToTop();
    initContactForm();
    updateCurrentYear();
    fetchAndDisplayFeaturedCourses();
    initNotificationSystem();

    // Navbar scroll effect and responsive behavior
    function initNavbar() {
        const navbar = document.getElementById('mainNavbar');
        if (!navbar) {
            console.warn('Navbar not found');
            return;
        }

        // Scroll effect
        function handleScroll() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        // Mobile menu close on link click
        const navLinks = navbar.querySelectorAll('.nav-link');
        const navbarCollapse = navbar.querySelector('.navbar-collapse');
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                    bsCollapse.hide();
                }
            });
        });

        console.log('✅ Navbar initialized');
    }

    // Enhanced smooth scrolling with proper offset
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const navbar = document.querySelector('.navbar');
                    const navbarHeight = navbar ? navbar.offsetHeight : 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Update active nav link
                    updateActiveNavLink(targetId);
                }
            });
        });

        console.log('✅ Smooth scrolling initialized');
    }

    // Update active navigation link
    function updateActiveNavLink(targetId) {
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === targetId) {
                link.classList.add('active');
            }
        });
    }

    // Back to top button functionality
    function initBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (!backToTopBtn) {
            console.warn('Back to top button not found');
            return;
        }

        function toggleBackToTop() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }

        window.addEventListener('scroll', toggleBackToTop);
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        console.log('✅ Back to top button initialized');
    }

    // Enhanced contact form with validation
    function initContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) {
            console.warn('Contact form not found');
            return;
        }

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('contactName')?.value.trim() || '',
                email: document.getElementById('contactEmail')?.value.trim() || '',
                subject: document.getElementById('contactSubject')?.value || '',
                message: document.getElementById('contactMessage')?.value.trim() || ''
            };

            // Validate form
            if (!validateContactForm(formData)) {
                return;
            }

            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitBtn.disabled = true;

            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                showNotification('Thank you! Your message has been sent successfully. We\'ll get back to you soon!', 'success');
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });

        console.log('✅ Contact form initialized');
    }

    // Form validation
    function validateContactForm(data) {
        const errors = [];

        if (!data.name) errors.push('Name is required');
        if (data.name && data.name.length < 2) errors.push('Name must be at least 2 characters');
        if (!data.email) errors.push('Email is required');
        if (!isValidEmail(data.email)) errors.push('Please enter a valid email address');
        if (!data.subject) errors.push('Please select a subject');
        if (!data.message) errors.push('Message is required');
        if (data.message && data.message.length < 10) errors.push('Message must be at least 10 characters');

        if (errors.length > 0) {
            showNotification(errors.join('. '), 'error');
            return false;
        }

        return true;
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Update current year in footer
    function updateCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // Enhanced featured courses fetching with better error handling
    async function fetchAndDisplayFeaturedCourses() {
        const container = document.getElementById('featured-courses-container');
        if (!container) {
            console.warn('Featured courses container not found');
            return;
        }

        try {
            // Show loading state
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="loading-spinner">
                        <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="text-muted">Loading amazing courses...</p>
                    </div>
                </div>
            `;

            const fetchURL = `${apiUrlBase}backend/get_featured_courses.php`;
            console.log('Fetching courses from:', fetchURL);
            
            const response = await fetch(fetchURL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('Courses data received:', responseData);
            
            // Clear loading state
            container.innerHTML = '';

            if (responseData.status === 0 && responseData.courses && responseData.courses.length > 0) {
                displayFeaturedCourses(responseData.courses, container);
                console.log(`✅ Displayed ${responseData.courses.length} featured courses`);
            } else {
                displayNoCoursesMessage(container);
                console.log('ℹ️ No courses available, showing placeholder message');
            }
        } catch (error) {
            console.error('Error fetching featured courses:', error);
            displayErrorMessage(container);
        }
    }

    // Display featured courses with enhanced styling
    function displayFeaturedCourses(courses, container) {
        courses.forEach((course, index) => {
            const randomStudents = Math.floor(Math.random() * 500) + 100;
            const randomRating = (4.2 + Math.random() * 0.7).toFixed(1);
            const courseCategories = ['Technology', 'Business', 'Design', 'Data Science', 'Marketing'];
            const randomCategory = courseCategories[Math.floor(Math.random() * courseCategories.length)];
            
            const courseHTML = `
                <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                    <div class="course-card">
                        <div class="course-image">
                            <i class="fas fa-play-circle" style="font-size: 3rem; color: var(--bright-cyan); opacity: 0.7;"></i>
                            <div style="position: absolute; top: 16px; right: 16px; background: rgba(107, 187, 68, 0.9); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                                FREE
                            </div>
                            <div style="position: absolute; top: 16px; left: 16px; background: rgba(47, 182, 214, 0.9); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem;">
                                ${randomCategory}
                            </div>
                            <div style="position: absolute; bottom: 16px; left: 16px; background: rgba(13, 36, 64, 0.8); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem;">
                                <i class="fas fa-clock me-1"></i>
                                ${Math.floor(Math.random() * 8) + 2}h ${Math.floor(Math.random() * 60)}m
                            </div>
                        </div>
                        <div class="course-card-body">
                            <h5>${course.title}</h5>
                            <p>${course.description.length > 120 ? course.description.substring(0, 120) + '...' : course.description}</p>
                            <div class="course-meta d-flex justify-content-between align-items-center mb-3">
                                <div class="course-stats">
                                    <span class="badge bg-bright-cyan me-2">
                                        <i class="fas fa-users me-1"></i>
                                        ${randomStudents}+
                                    </span>
                                    <span class="badge bg-success-green">
                                        <i class="fas fa-star me-1"></i>
                                        ${randomRating}
                                    </span>
                                </div>
                            </div>
                            <div class="course-action">
                                <a href="student/course-content.html?courseId=${course.course_id}" class="btn btn-outline-primary w-100">
                                    <i class="fas fa-arrow-right me-2"></i>
                                    Enroll Now
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', courseHTML);
        });

        // Refresh AOS for new elements
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    // Display no courses message
    function displayNoCoursesMessage(container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="empty-state">
                    <i class="fas fa-book-open mb-3" style="font-size: 4rem; color: var(--bright-cyan); opacity: 0.5;"></i>
                    <h4 style="color: var(--navy-brand); margin-bottom: 16px;">Amazing Courses Coming Soon!</h4>
                    <p class="text-muted mb-4">We're curating the best learning experiences for you. Be the first to know when they're ready!</p>
                    <div class="row justify-content-center">
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="email" class="form-control" placeholder="Enter your email for updates" id="notifyEmail">
                                <button class="btn btn-primary-cta" type="button" onclick="subscribeToNotifications()">
                                    <i class="fas fa-bell me-2"></i>
                                    Notify Me
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Display error message
    function displayErrorMessage(container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle mb-3" style="font-size: 3rem; color: var(--flag-red); opacity: 0.7;"></i>
                    <h4 style="color: var(--navy-brand); margin-bottom: 16px;">Oops! Something went wrong</h4>
                    <p class="text-muted mb-4">We're having trouble loading our courses right now. Please try again in a moment.</p>
                    <button onclick="location.reload()" class="btn btn-outline-primary">
                        <i class="fas fa-refresh me-2"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    // Enhanced notification system
    function initNotificationSystem() {
        // Add CSS for notifications if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
                
                .notification {
                    animation: slideInRight 0.3s ease-out;
                }
                
                .notification.hiding {
                    animation: slideOutRight 0.3s ease-in forwards;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        });

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: '#6BBB44',
            error: '#E0413A',
            info: '#2FB6D6',
            warning: '#F4A23A'
        };

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            max-width: 400px;
            backdrop-filter: blur(10px);
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="${icons[type] || icons.info}"></i>
                <span style="flex: 1;">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; padding: 0; margin-left: 8px;"
                        title="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('hiding');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Make showNotification globally available
    window.showNotification = showNotification;

    // Subscribe to notifications function (global scope for onclick)
    window.subscribeToNotifications = function() {
        const emailInput = document.getElementById('notifyEmail');
        if (!emailInput) return;

        const email = emailInput.value.trim();
        if (!email || !isValidEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Simulate subscription (replace with actual API call)
        showNotification('Thank you! We\'ll notify you when new courses are available.', 'success');
        emailInput.value = '';
    };

    // Enhanced scroll spy for navigation
    function initScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link[href^="#"]');

        function updateActiveLink() {
            let current = '';
            const scrollPosition = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
                const sectionHeight = section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }

        // Debounce scroll events for better performance
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateActiveLink, 10);
        });
        
        updateActiveLink(); // Initial check
    }

    // Initialize scroll spy
    initScrollSpy();

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Escape key closes notifications
        if (e.key === 'Escape') {
            const notifications = document.querySelectorAll('.notification');
            notifications.forEach(notification => {
                notification.classList.add('hiding');
                setTimeout(() => notification.remove(), 300);
            });
        }
    });

    // Course enrollment utility
    window.enrollInCourse = function(courseId) {
        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        
        if (!isLoggedIn) {
            if (confirm('You need to sign in to enroll in courses. Would you like to sign up now?')) {
                window.location.href = 'authentication-register.html';
            }
            return;
        }
        
        // Redirect to course content
        window.location.href = `student/course-content.html?courseId=${courseId}`;
    };

    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log(`📊 Page load time: ${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`);
                }
            }, 0);
        });
    }

    console.log('🎉 Spydertech LMS landing page fully initialized!');
    
    // Show welcome message
    setTimeout(() => {
        showNotification('Welcome to Spydertech LMS! Explore our courses and start your learning journey.', 'info');
    }, 2000);
});