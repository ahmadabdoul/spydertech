const url = localStorage.getItem('url');
let user = sessionStorage.getItem('user');
user = JSON.parse(user);
console.log(user);

$(document).ready(function () {
    showloader();
    fetchQuestions();
    hideloader();
}); 

function answerQuestion(id) {
    window.location.href = `answer-question.html?id=${id}`;
}
async function fetchQuestions() {
    
    const response = await fetch(`${url}teacher/get-questions.php?id=${user.id}`);
    const resData = await response.json();
    console.log(resData);
    if (resData.status == 0) {
        
        const questionsTable = $('<table>').addClass('table').attr('id', 'questions_table');
        const tableHead = $('<thead>').appendTo(questionsTable);
        const tableBody = $('<tbody>').appendTo(questionsTable);
        const tableHeadRow = $('<tr>').appendTo(tableHead);
        $('<th>').text('Student Name').appendTo(tableHeadRow);
        $('<th>').text('Course Name').appendTo(tableHeadRow);
        $('<th>').text('Question').appendTo(tableHeadRow);
        $('<th>').text('Answer').appendTo(tableHeadRow);
        $('<th>').text('Date').appendTo(tableHeadRow);
        $('<th>').text('Action').appendTo(tableHeadRow);

        questions = resData.questions;
        questions.forEach((question) => {
          const tableRow = $('<tr>').appendTo(tableBody);
          $('<td>').text(question.student_name).appendTo(tableRow);
          $('<td>').text(question.course_name).appendTo(tableRow);
            $('<td>').text(question.question).appendTo(tableRow);
            $('<td>').text(question.answer).appendTo(tableRow);
          $('<td>').text(question.date).appendTo(tableRow);
          $('<td>').html(`<button class="btn btn-primary" onclick="answerQuestion(${question.id})">Answer</button>`).appendTo(tableRow);
        });
  
        $('#questions_list').empty().append(questionsTable);
        const dataTable = new simpleDatatables.DataTable('#questions_table');
    } else {
        swal('Oops', resData.message, 'error');
    }
}