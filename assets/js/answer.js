const url = localStorage.getItem('url');
let user = sessionStorage.getItem('user');
user = JSON.parse(user);
console.log(user);

$(document).ready(function () {
 //GET URL PARAMS
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    getQuestion(id);

    $('#answerBtn').click(function (e) {
        e.preventDefault()
        answerQuestion(id);
    });
}); 

async function answerQuestion(id) {
    showloader();
    const data = {
        id: id,
        answer: $('#answer').val(),
    };
    const response = await fetch(`${url}teacher/answer-question.php`, {
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
        window.location.href = 'questions.html';
    } else {
        swal('Oops', resData.message, 'error');
    }
    hideloader();
}



async function getQuestion(id) {
    showloader();
    try {
        const response = await fetch(`${url}teacher/get-question.php?id=${id}`);
        const resData = await response.json();
        console.log(resData);
        if (!response.ok) {
            throw new Error(resData.description);
        }
        if (resData.status === 0) {

            $('#date').html(resData.data.date);
            $('#question').html(resData.data.question);
            $('#answer').html(resData.data.answer);
            $('#student').val(resData.data.student_name);
            $('#courseTitle').val(resData.data.course_name);
            
        } else {
            swal('Oops', resData.message, 'error');
        }
        hideloader();
    } catch (error) {
        swal('Oops', error.message, 'error');
        hideloader();
    }
    hideloader();
}