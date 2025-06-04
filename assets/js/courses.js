const url = localStorage.getItem('url');

async function listCourses() {
  try {
    const response = await fetch(`${url}student/list-courses.php?limit=4`);
    const resData = await response.json();
    const courses = resData.courses;

    // Create the table element
    const table = document.createElement('table');
    table.id = 'coursesTable';

    // Create the table header
    const thead = document.createElement('thead');
    // Define the table header column names
    const headers = [
      'ID',
      'Title',
      'Description',
      'Teacher Username',
      'Enrollment Fee',
      'Certificate Fee',
      'Actions',
    ];

    headers.forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header;
      thead.appendChild(th);
    });

    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement('tbody');

    courses.forEach((course) => {
      const { id, title, description, teacher_username, enrollment_fee, certificate_fee } = course;

      const row = document.createElement('tr');
      const idCell = document.createElement('td');
      const titleCell = document.createElement('td');
      const descriptionCell = document.createElement('td');
      const teacherCell = document.createElement('td');
      const enrollmentFeeCell = document.createElement('td');
      const certificateFeeCell = document.createElement('td');
      const actionsCell = document.createElement('td');

      idCell.textContent = id;
      titleCell.textContent = title;
      descriptionCell.textContent = description;
      teacherCell.textContent = teacher_username;

      // Format and set fee information
      const parsedEnrollmentFee = parseFloat(enrollment_fee);
      enrollmentFeeCell.textContent = parsedEnrollmentFee > 0 ? '$' + parsedEnrollmentFee.toFixed(2) : 'Free';

      const parsedCertificateFee = parseFloat(certificate_fee);
      certificateFeeCell.textContent = parsedCertificateFee > 0 ? '$' + parsedCertificateFee.toFixed(2) : 'Free';

      row.appendChild(idCell);
      row.appendChild(titleCell);
      row.appendChild(descriptionCell);
      row.appendChild(teacherCell);
      row.appendChild(enrollmentFeeCell);
      row.appendChild(certificateFeeCell);

      // Create the action button for enrollment
      const enrollButton = document.createElement('button');
      enrollButton.classList.add('btn');
      enrollButton.classList.add('btn-primary');
      enrollButton.textContent = 'Enroll/Follow';
      enrollButton.addEventListener('click', () => {
        enrollCourse(id); // Replace enrollCourse with your enrollment function
      });

      actionsCell.appendChild(enrollButton);
      row.appendChild(actionsCell);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Append the table to the desired element in your HTML file
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.appendChild(table);

    // Initialize DataTables without jQuery
    const dataTable = new simpleDatatables.DataTable(table);
  } catch (error) {
    console.log(error);
  }
}

showloader();
listCourses();
hideloader();
async function enrollCourse(course) {
  courseId = course;
  user = sessionStorage.getItem('user');
  user = JSON.parse(user);

  userId = user.id;
  showloader();
  data = {
    courseId: courseId,
    userId: userId,
  };
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
}
