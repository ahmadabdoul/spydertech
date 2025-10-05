const url = localStorage.getItem('url');

async function listCourses() {
  try {
    showloader();
    const response = await fetch(`${url}student/list-courses.php?limit=4`);
    const resData = await response.json();
    hideloader();

    if (resData.status !== 0) {
        swal('Error', resData.message, 'error');
        return;
    }

    const courses = resData.courses;

    // Create the table element
    const table = document.createElement('table');
    table.id = 'coursesTable';
    table.className = 'table table-striped';

    // Create the table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    // Define the table header column names
    const headers = [
      'ID',
      'Title',
      'Description',
      'Teacher',
      'Enrollment Fee',
      'Certificate Fee',
      'Actions',
    ];

    headers.forEach((headerText) => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement('tbody');

    courses.forEach((course) => {
      const { id, title, description, teacher_username, enrollment_fee, certificate_fee } = course;

      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${id}</td>
        <td>${title}</td>
        <td>${description}</td>
        <td>${teacher_username}</td>
        <td>${parseFloat(enrollment_fee) > 0 ? '$' + parseFloat(enrollment_fee).toFixed(2) : 'Free'}</td>
        <td>${parseFloat(certificate_fee) > 0 ? '$' + parseFloat(certificate_fee).toFixed(2) : 'Free'}</td>
        <td><button class="btn btn-primary enroll-btn" data-course-id="${id}">Enroll</button></td>
      `;

      tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Append the table to the desired element in your HTML file
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = ''; // Clear previous content
    tableContainer.appendChild(table);

    // Add event listeners to the new buttons
    document.querySelectorAll('.enroll-btn').forEach(button => {
        button.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course-id');
            enrollCourse(courseId);
        });
    });

    // Initialize DataTables without jQuery
    new simpleDatatables.DataTable(table);

  } catch (error) {
    hideloader();
    swal('Error', 'Failed to load courses. Please try again.', 'error');
    console.log(error);
  }
}

async function enrollCourse(courseId) {
  showloader();

  let user = sessionStorage.getItem('user');

  if (!user) {
    hideloader();
    swal({
      title: 'Not Logged In',
      text: 'You need to be logged in to enroll in a course.',
      icon: 'error',
      button: 'Go to Login',
    }).then(() => {
      window.location.href = '../authentication-login.html'; // Redirect to login page
    });
    return; // Stop execution
  }

  try {
    user = JSON.parse(user);
  } catch (e) {
    hideloader();
    swal('Error', 'There was an issue with your session. Please log in again.', 'error');
    return;
  }

  const userId = user.id;

  if (!userId) {
      hideloader();
      swal('Error', 'Could not identify you. Please try logging in again.', 'error');
      return;
  }

  const data = {
    courseId: courseId,
    userId: userId,
  };

  try {
    const response = await fetch(`${url}student/enroll-course.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const resData = await response.json();

    hideloader();
    if (resData.status === 0) {
      swal('Success', resData.message, 'success');
    } else {
      swal('Error', resData.message, 'error');
    }
  } catch (error) {
    hideloader();
    swal('Error', 'An unexpected error occurred during enrollment. Please try again.', 'error');
    console.error('Enrollment error:', error);
  }
}

// Initial load
listCourses();