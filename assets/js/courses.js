const url = localStorage.getItem('url');

async function listCourses() {
  try {
    showloader();
    // The backend now uses the session to get the userId, so no need to pass it in the URL
    const response = await fetch(`${url}student/list-courses.php?limit=4`);
    const resData = await response.json();
    hideloader();

    if (resData.status !== 0) {
        swal('Error', resData.message, 'error');
        return;
    }

    const courses = resData.courses;

    const table = document.createElement('table');
    table.id = 'coursesTable';
    table.className = 'table table-striped';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
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

    const tbody = document.createElement('tbody');

    courses.forEach((course) => {
      const { id, title, description, teacher_username, enrollment_fee, certificate_fee, enrollment_status } = course;

      const row = document.createElement('tr');

      // Create cells
      row.innerHTML = `
        <td>${id}</td>
        <td>${title}</td>
        <td>${description}</td>
        <td>${teacher_username}</td>
        <td>${parseFloat(enrollment_fee) > 0 ? '$' + parseFloat(enrollment_fee).toFixed(2) : 'Free'}</td>
        <td>${parseFloat(certificate_fee) > 0 ? '$' + parseFloat(certificate_fee).toFixed(2) : 'Free'}</td>
      `;

      // Create the actions cell with the dynamic button
      const actionsCell = document.createElement('td');
      const actionButton = document.createElement('button');
      actionButton.classList.add('btn');
      actionButton.setAttribute('data-course-id', id);

      switch (enrollment_status) {
          case 'In Progress':
              actionButton.textContent = 'Enrolled';
              actionButton.classList.add('btn-success');
              actionButton.disabled = true;
              break;
          case 'Completed':
              actionButton.textContent = 'Completed';
              actionButton.classList.add('btn-info');
              actionButton.disabled = true;
              break;
          default: // Not Enrolled
              actionButton.textContent = 'Enroll';
              actionButton.classList.add('btn-primary', 'enroll-btn');
              actionButton.addEventListener('click', function() {
                  enrollCourse(this.getAttribute('data-course-id'));
              });
              break;
      }

      actionsCell.appendChild(actionButton);
      row.appendChild(actionsCell);
      tbody.appendChild(row);
    });

    table.appendChild(tbody);

    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = ''; // Clear previous content
    tableContainer.appendChild(table);

    // Initialize DataTables
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
      window.location.href = '../authentication-login.html';
    });
    return;
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

      // Update the button state in real-time
      const enrolledButton = document.querySelector(`.enroll-btn[data-course-id="${courseId}"]`);
      if (enrolledButton) {
          enrolledButton.textContent = 'Enrolled';
          enrolledButton.disabled = true;
          enrolledButton.classList.remove('btn-primary', 'enroll-btn');
          enrolledButton.classList.add('btn-success');
      }

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