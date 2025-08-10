const url = localStorage.getItem('url');
let user = sessionStorage.getItem('user');
user = JSON.parse(user);

let courseContents = [];

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  let title = '';
  let description = '';
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
      renderCourseContents(courseContents);

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

function renderCourseContents(contents) {
  const contentsContainer = $('#course_contents');
  contentsContainer.empty();

  if (contents.length === 0) {
    contentsContainer.html('<p>No content has been added to this course yet.</p>');
    return;
  }

  const table = $('<table>').addClass('table');
  const thead = $('<thead>').appendTo(table);
  const tbody = $('<tbody>').appendTo(table);

  const headRow = $('<tr>').appendTo(thead);
  $('<th>').text('Chapter').appendTo(headRow);
  $('<th>').text('Lesson Title').appendTo(headRow);
  $('<th>').text('Content Type').appendTo(headRow);
  $('<th>').text('Actions').appendTo(headRow);

  contents.forEach(content => {
    const row = $('<tr>').appendTo(tbody);
    $('<td>').text(content.chapter_title).appendTo(row);
    $('<td>').text(content.title).appendTo(row);
    $('<td>').text(content.video_type || 'text').appendTo(row);
    const actionsCell = $('<td>').appendTo(row);
    $('<button>').addClass('btn btn-sm btn-info me-2 edit-btn').text('Edit').data('id', content.id).appendTo(actionsCell);
    $('<button>').addClass('btn btn-sm btn-danger delete-btn').text('Delete').data('id', content.id).appendTo(actionsCell);
  });

  contentsContainer.append(table);
}

$('#addContentBtn').click(function () {
  $('#addContentModal').modal('show');
});

$('#contentType').change(function () {
  const selectedType = $(this).val();
  $('#textContent, #videoUrl, #videoFile').hide();
  if (selectedType === 'text') {
    $('#textContent').show();
  } else if (selectedType === 'url') {
    $('#videoUrl').show();
  } else if (selectedType === 'file') {
    $('#videoFile').show();
  }
});

$('#saveContentBtn').click(async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const form = $('#addContentForm')[0];
  const formData = new FormData(form);
  formData.append('course_id', courseId);

  const contentId = $('#contentId').val();
  const endpoint = contentId ? 'update-course-content.php' : 'upload-course-content.php';
  if(contentId) formData.append('id', contentId);

  try {
    showloader();
    const response = await fetch(`${url}teacher/${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    const resData = await response.json();

    if (resData.status === 0) {
      swal('Success', resData.message, 'success');
      $('#addContentModal').modal('hide');
      getCourse(courseId); // Refresh the course content
    } else {
      swal('Oops', resData.message, 'error');
    }
  } catch (error) {
    swal('Error', error.message, 'error');
  } finally {
    hideloader();
  }
});

$(document).on('click', '.edit-btn', function () {
    const contentId = $(this).data('id');
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    // We need to get the full course contents array.
    // A simple way is to fetch it again or use a global variable if it's stored.
    // Assuming `courseContents` is available in the scope.
    const content = courseContents.find(c => c.id == contentId);

    if (content) {
        $('#contentId').val(content.id);
        $('#chapterTitle').val(content.chapter_title);
        $('#lessonTitle').val(content.title);
        $('#contentType').val(content.video_type || 'text');
        $('#contentType').trigger('change');
        $('#textContentArea').val(content.content);
        $('#videoUrlInput').val(content.video_url);

        $('#addContentModalLabel').text('Edit Course Content');
        $('#addContentModal').modal('show');
    }
});

$('#addContentModal').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget); // Button that triggered the modal
    const action = button.data('action'); // Extract info from data-* attributes

    if (action === 'add') {
        $('#addContentForm')[0].reset();
        $('#contentId').val('');
        $('#addContentModalLabel').text('Add New Course Content');
    }
});

$('#addContentBtn').click(function () {
    $('#addContentModal').data('action', 'add').modal('show');
});

$(document).on('click', '.delete-btn', function () {
    const contentId = $(this).data('id');
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this content!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then(async (willDelete) => {
        if (willDelete) {
            try {
                showloader();
                const response = await fetch(`${url}teacher/delete-course-content.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: contentId })
                });

                const resData = await response.json();

                if (resData.status === 0) {
                    swal("Poof! The content has been deleted!", {
                        icon: "success",
                    });
                    const urlParams = new URLSearchParams(window.location.search);
                    const courseId = urlParams.get('id');
                    getCourse(courseId); // Refresh the course content
                } else {
                    swal('Oops', resData.message, 'error');
                }
            } catch (error) {
                swal('Error', error.message, 'error');
            } finally {
                hideloader();
            }
        }
    });
});
