const url = localStorage.getItem('url');
const APP_URL = localStorage.getItem('url') || ''; // Ensure APP_URL is defined for consistency
let user = sessionStorage.getItem('user');
user = JSON.parse(user);
const user_id = user.id; // Ensure user_id is consistently named and available

async function listActiveCourses() {
  try {
    const response = await fetch(
      `${url}student/get-student-courses.php?id=${user_id}`
    );
    const resData = await response.json();

    if (resData.status !== 0 || !resData.courses) {
      console.error("Failed to fetch active courses or no courses found:", resData.message);
      const tableContainer = document.getElementById('tableContainer');
      if (tableContainer) {
        tableContainer.innerHTML = `<p>Could not load active courses: ${resData.message || 'No courses found or error fetching data.'}</p>`;
      }
      const courseLengthElement = document.querySelector('.courselength');
      if (courseLengthElement) {
        courseLengthElement.textContent = resData.courses ? resData.courses.length : 0;
      }
      return;
    }

    const courses = resData.courses;
    const courseLengthElement = document.querySelector('.courselength');
    if (courseLengthElement) {
        courseLengthElement.textContent = courses.length;
    }

    const tableContainer = document.getElementById('tableContainer');
    if (!tableContainer) {
        console.error("Table container 'tableContainer' not found.");
        return;
    }
    tableContainer.innerHTML = ''; // Clear previous content

    const table = document.createElement('table');
    table.id = 'coursesTable';
    table.classList.add('table', 'table-striped');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['ID', 'Title', 'Status', 'Actions'];

    headers.forEach((headerText) => {
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
        cell.textContent = 'No active courses found.';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tbody.appendChild(row);
    } else {
        courses.forEach((course) => {
          const { course_id, course_title, completion_status } = course;

          const row = document.createElement('tr');
          const idCell = document.createElement('td');
          const titleCell = document.createElement('td');
          const statusCell = document.createElement('td');
          const actionsCell = document.createElement('td');

          idCell.textContent = course_id;
          titleCell.textContent = course_title;
          statusCell.textContent = completion_status || 'N/A';

          row.appendChild(idCell);
          row.appendChild(titleCell);
          row.appendChild(statusCell);

          const viewButton = document.createElement('a');
          viewButton.classList.add('btn', 'btn-primary', 'btn-sm', 'me-2');
          viewButton.textContent = 'View';
          viewButton.href = `course-content.html?course=${course_id}`;

          actionsCell.appendChild(viewButton);

          if (completion_status === 'Completed') {
            const certificateButton = document.createElement('a');
            certificateButton.classList.add('btn', 'btn-success', 'btn-sm');
            certificateButton.textContent = 'Get Certificate';
            certificateButton.href = `${APP_URL}student/generate_certificate.php?course_id=${course_id}&student_id=${user_id}`;
            certificateButton.target = '_blank';

            actionsCell.appendChild(certificateButton);
          }

          row.appendChild(actionsCell);
          tbody.appendChild(row);
        });
    }

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    if (typeof simpleDatatables !== 'undefined') {
      const dataTable = new simpleDatatables.DataTable(table);
    } else {
      console.warn('simpleDatatables library not found. Table will not be enhanced.');
    }

  } catch (error) {
    console.error("Error in listActiveCourses:", error);
    const tableContainer = document.getElementById('tableContainer');
    if (tableContainer) {
        tableContainer.innerHTML = `<p class='text-danger'>An error occurred while loading active courses: ${error.message}</p>`;
    }
    const courseLengthElement = document.querySelector('.courselength');
    if (courseLengthElement) {
      courseLengthElement.textContent = 'Error';
    }
  }
}

// This function is kept if used elsewhere, but buttons now use href directly
function viewCourse(course_id) {
  location.href = `course-content.html?course=${course_id}`;
}

document.addEventListener('DOMContentLoaded', () => {
    showloader();
    listActiveCourses().then(() => {
        hideloader();
    }).catch((error) => {
        console.error("Error during initial active courses load:", error);
        hideloader();
    });
});
