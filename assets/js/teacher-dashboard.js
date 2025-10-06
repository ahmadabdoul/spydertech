const url = localStorage.getItem('url');
let user = sessionStorage.getItem('user');
user = JSON.parse(user);
console.log(user);

async function fetchTeacherProfile() {
    if (!user || !user.id) {
        console.error('Teacher ID not found for fetching profile.');
        return;
    }
    try {
        const response = await fetch(`${url}teacher/get-teacher.php?id=${user.id}`);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return;
        }
        const resData = await response.json();
        if (resData.status === 0 && resData.teacher) {
            const walletBalanceDisplayEl = document.getElementById('walletBalance');
            if (walletBalanceDisplayEl) {
                const wallet_balance = parseFloat(resData.teacher.wallet_balance);
                walletBalanceDisplayEl.textContent = '$' + (isNaN(wallet_balance) ? '0.00' : wallet_balance.toFixed(2));
            }
        } else {
            console.error('Failed to fetch teacher profile:', resData.message);
        }
    } catch (error) {
        console.error('Error fetching teacher profile:', error);
    }
}

$(document).ready(function () {
    fetchTeacherProfile(); // Fetch the latest profile data, including wallet balance
    fetchCourses();
    $('input[name="videoType"]').change(function () {
        let videoType = $(this).val();
        if ($(this).val() === 'file') {
            $('#videoDiv').css('display', 'block');
            $('#urlDiv').css('display', 'none');
        } else {
            $('#videoDiv').css('display', 'none');
            $('#urlDiv').css('display', 'block');
        }
    });

    $('#createCourse').click(function (e) {
        e.preventDefault();

        const data = {
            title: $('#courseTitle').val(),
            description: $('#description').val(),
            teacher_id: user.id,
           
        };
      createCourse(data);
    });

    $('#uploadVideo').click(function (e) {
        e.preventDefault();
        uploadContent();
    });

    // Add event listener for the Withdraw button
    $(document).on('click', '#withdraw-btn', function() {
        swal({
            title: 'Withdraw Funds',
            text: 'Withdrawal system integration is not yet available. This is a placeholder.',
            icon: 'info',
            button: 'OK',
        });
    });
});

async function createCourse(data) {
    showloader();
    const response = await fetch(`${url}teacher/create-course.php`, {
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
        
    }else{
        swal('Oops', resData.message, 'error');
    }
    hideloader();
}

async function fetchCourses(){
    showloader()
    const response = await fetch(`${url}teacher/list-teacher-courses.php?id=${user.id}`);
    const resData = await response.json();
    console.log(resData);
    if (resData.status == 0) {
        const courses = resData.courses;
        //poplate the course select
        courses.forEach(course => {
            $('#course').append(`<option value="${course.id}">${course.title}</option>`)
        });
        //make a table of the courses

        $('#blue').append(`<table id="courseTable" class="table table-responsive">
        <thead>
            <tr>
                <th>Course Title</th>
                <th>Description</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody id="courseTableBody">`);

        courses.forEach(course => {
            $('#courseTable').append(`
            <tr>
            <td>${course.title}</td>
            <td>${course.description}</td>
             <td><a href="course-content.html?id=${course.id}" class="btn">View</a> 
           
             <a href="deleteCourse()" class="btn">Delete</a></td>
            </tr>`
            )
        });
        $('#blue').append(`</tbody></table>`);
    }else{
        swal('Oops', resData.message, 'error');
    }
    hideloader();
}

async function uploadContent(){
    showloader();
    data = {
        course_id: $('#course').val(),
        title: $('#contentTitle').val(),
        content: $('#contentDescription').val(),
        video_type: $('input[name="videoType"]:checked').val(),
    }
    if($('input[name="videoType"]:checked').val() === 'file'){
        const formData = new FormData();
        formData.append('video', $('#video').prop('files')[0]);
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        postData = formData;
    }else{
        data.url = $('#url').val();
        postData = JSON.stringify(data);
    }
    const response = await fetch(`${url}teacher/upload-course-content.php`, {
        method: 'POST',
        body: postData,
    });
    const resData = await response.json();
    console.log(resData);
    if (resData.status == 0) {
        swal('Success', resData.message, 'success');
    }else{
        swal('Oops', resData.message, 'error');
    }
    hideloader();
}