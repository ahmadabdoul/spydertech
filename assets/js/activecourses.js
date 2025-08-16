const url = localStorage.getItem('url');
let user = sessionStorage.getItem('user');
user = JSON.parse(user);
user_id = user.id;

async function listActiveCourses() {
  try {
    const response = await fetch(
      `${url}student/get-student-courses.php?id=${user_id}`
    );
    const resData = await response.json();
    const courses = resData.courses;

    courseLengthElement = document.getElementsByClassName('courselength');
    courseLengthElement.innerHTML = courses.length;
    // Create the table element
    const table = document.createElement('table');
    table.id = 'coursesTable';

    // Create the table header
    const thead = document.createElement('thead');
    // Define the table header column names
    const headers = ['ID', 'Title', 'Status', 'Actions'];

    headers.forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header;
      thead.appendChild(th);
    });

    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement('tbody');

    courses.forEach((course) => {
      const { course_id, course_title, completion_status } = course;

      const row = document.createElement('tr');
      const idCell = document.createElement('td');
      const titleCell = document.createElement('td');
      const statusCell = document.createElement('td');
      const actionsCell = document.createElement('td');

      idCell.textContent = course_id;
      titleCell.textContent = course_title;
      statusCell.textContent = completion_status;

      row.appendChild(idCell);
      row.appendChild(titleCell);
      row.appendChild(statusCell);

      // Create the action button for enrollment
      const enrollButton = document.createElement('button');
      enrollButton.classList.add('btn');
      enrollButton.classList.add('btn-primary');
      enrollButton.textContent = 'View';
      enrollButton.addEventListener('click', () => {
        viewCourse(course_id); // Replace enrollCourse with your enrollment function
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
listActiveCourses();
hideloader();
function viewCourse(course) {
  courseId = course;
  location.href = `course-content.html?course=${course}`;
}
