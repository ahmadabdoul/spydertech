const url = localStorage.getItem('url');
let user = sessionStorage.getItem('user');
user = JSON.parse(user);

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  let title = '';
  let description = '';
  let courseContents = [];
  let students = [];
  let students_count = [];
  let completionRate = '';

  getCourse(id);

    $('#update').click(function (e) {
        e.preventDefault();
        const data = {
            id: id,
            title: $('#title').val(),
            description: $('#description').val(),
        };
        showloader();
        updateCourse(data);
        hideloader();
    }
    );
});

async function updateCourse(data) {
    const response = await fetch(`${url}teacher/update-course.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const resData = await response.json();
    console.log(resData);
    if (resData.status == 0) {
        swal('Success', resData.message, 'success');
        window.location.reload();
    } else {
        swal('Oops', resData.message, 'error');
    }
}

async function getCourse(id) {
  showloader();
  try {
    const response = await fetch(`${url}teacher/get-course.php?id=${id}`);
    const resData = await response.json();

    if (!response.ok) {
      throw new Error(resData.description);
    }

    if (resData.status === 0) {
      title = resData.title;
      description = resData.description;
      courseContents = resData.course_contents;
      students = resData.students_enrolled.data;
      students_count = resData.students_enrolled.count;
      completionRate = resData.completion_rate;

      $('.completion_rate').html(`${completionRate}%`);
      $('.enrolled_count').html(`${students_count}`);

      // Populate course details
      $('#title').val(title);
      $('#description').html(description);

      // Populate course contents
      const contentsList = $('#course_contents');
      contentsList.empty();
      courseContents.forEach((content, index) => {
        const listItem = $('<li></li>').text(`${index + 1}. ${content.title}`);
        contentsList.append(listItem);
      });

      // Create table for student list
      const studentsTable = $('<table>').addClass('table').attr('id', 'students_table');
      const tableHead = $('<thead>').appendTo(studentsTable);
      const tableBody = $('<tbody>').appendTo(studentsTable);
      const tableHeadRow = $('<tr>').appendTo(tableHead);
      $('<th>').text('Student Name').appendTo(tableHeadRow);
      $('<th>').text('Completion Status').appendTo(tableHeadRow);
      $('<th>').text('Start Date').appendTo(tableHeadRow);

      students.forEach((student) => {
        const tableRow = $('<tr>').appendTo(tableBody);
        $('<td>').text(student.name).appendTo(tableRow);
        $('<td>').text(student.completion_status).appendTo(tableRow);
        $('<td>').text(student.start_date).appendTo(tableRow);
      });

      $('#students_list').empty().append(studentsTable);
      const dataTable = new simpleDatatables.DataTable('#students_table');
    } else {
      swal('Oops', resData.message, 'error');
    }
  } catch (error) {
    swal('Error', error.message, 'error');
  } finally {
    hideloader();
  }
}
