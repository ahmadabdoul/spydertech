const url = localStorage.getItem('url');
const APP_URL = localStorage.getItem('url') || ''; // Consistent APP_URL definition

// Function to get current user's enrolled course IDs
async function getEnrolledCourseIds(userId) {
    if (!userId) return new Set(); // Return an empty set if no userId
    try {
        const response = await fetch(`${APP_URL}student/get-student-courses.php?id=${userId}`);
        if (!response.ok) {
            console.error('Failed to fetch student courses:', response.status);
            return new Set();
        }
        const resData = await response.json();
        if (resData.status === 0 && resData.courses) {
            const enrolledIds = new Set();
            resData.courses.forEach(course => enrolledIds.add(String(course.course_id))); // Ensure course_id is string for comparison
            return enrolledIds;
        }
        return new Set();
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        return new Set();
    }
}

async function listCourses() {
  let currentUserId = null;
  try {
    const userSession = sessionStorage.getItem('user');
    if (userSession) {
        const user = JSON.parse(userSession);
        currentUserId = user.id;
    }

    const enrolledCourseIds = await getEnrolledCourseIds(currentUserId);

    // Fetch all courses to list
    const response = await fetch(`${APP_URL}student/list-courses.php?limit=100`); // Increased limit or implement pagination later
    if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
    }
    const resData = await response.json();
    if (resData.status !== 0 || !resData.courses) {
        throw new Error(resData.message || 'No courses found or error in response.');
    }
    const courses = resData.courses;

    const tableContainer = document.getElementById('tableContainer');
    if (!tableContainer) {
      console.error("DOM element 'tableContainer' not found.");
      return;
    }
    tableContainer.innerHTML = ''; // Clear previous table

    const table = document.createElement('table');
    table.id = 'coursesTable';
    table.classList.add('table', 'table-striped');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = [
      'ID', 'Title', 'Description', 'Teacher',
      'Enroll Fee', 'Cert. Fee', 'Actions'
    ];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    if (courses.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = headers.length;
        cell.textContent = 'No courses available at the moment.';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tbody.appendChild(row);
    } else {
        courses.forEach(course => {
          const { id, title, description, teacher_username, enrollment_fee, certificate_fee } = course;
          const courseIdStr = String(id); // Ensure course ID is string for comparison

          const row = document.createElement('tr');
          row.insertCell().textContent = id;
          row.insertCell().textContent = title;
          const descCell = row.insertCell();
          descCell.textContent = description.length > 50 ? description.substring(0, 50) + '...' : description;
          descCell.title = description; // Show full description on hover
          row.insertCell().textContent = teacher_username;

          const parsedEnrollmentFee = parseFloat(enrollment_fee);
          row.insertCell().textContent = parsedEnrollmentFee > 0 ? '$' + parsedEnrollmentFee.toFixed(2) : 'Free';

          const parsedCertificateFee = parseFloat(certificate_fee);
          row.insertCell().textContent = parsedCertificateFee > 0 ? '$' + parsedCertificateFee.toFixed(2) : 'Free';

          const actionsCell = row.insertCell();

          if (enrolledCourseIds.has(courseIdStr)) {
            const viewButton = document.createElement('a');
            viewButton.classList.add('btn', 'btn-info', 'btn-sm');
            viewButton.textContent = 'View Course';
            viewButton.href = `course-content.html?course=${id}`;
            actionsCell.appendChild(viewButton);
          } else {
            const enrollButton = document.createElement('button');
            enrollButton.classList.add('btn', 'btn-primary', 'btn-sm');
            enrollButton.textContent = 'Enroll'; // Changed from 'Enroll/Follow'
            enrollButton.addEventListener('click', () => {
              enrollCourse(id);
            });
            actionsCell.appendChild(enrollButton);
          }
          tbody.appendChild(row);
        });
    }
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    if (typeof simpleDatatables !== 'undefined') {
      new simpleDatatables.DataTable(table);
    } else {
      console.warn('simpleDatatables library not found.');
    }

  } catch (error) {
    console.error('Error in listCourses:', error);
    const tableContainer = document.getElementById('tableContainer');
    if (tableContainer) {
        tableContainer.innerHTML = `<p class='text-danger'>Could not load courses: ${error.message}</p>`;
    }
  }
}

async function enrollCourse(courseId) {
  const userSession = sessionStorage.getItem('user');
  if (!userSession) {
    swal('Not Logged In', 'You need to be logged in to enroll.', 'warning');
    return;
  }
  const user = JSON.parse(userSession);
  const userId = user.id;

  showloader();
  const data = {
    courseId: courseId,
    userId: userId, // Changed from 'userId' to 'userId' to match typical var naming, backend expects userId
  };

  try {
    const response = await fetch(`${APP_URL}student/enroll-course.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const resData = await response.json();

    if (resData.status === 0) {
      swal('Success', resData.message, 'success').then(() => {
        listCourses(); // Refresh the list to show the updated button state
      });
    } else {
      swal('Error', resData.message, 'error');
    }
  } catch (error) {
    console.error('Enrollment request failed:', error);
    swal('Error', 'An error occurred during enrollment. Please try again.', 'error');
  } finally {
    hideloader();
  }
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  showloader();
  listCourses().then(() => {
    hideloader();
  }).catch(() => {
    hideloader(); // Ensure loader is hidden even on error
  });
});
