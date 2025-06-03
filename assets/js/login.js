//localStorage.setItem('url', 'http://192.168.1.101/lms/');
const url = localStorage.getItem('url');
const form = document.querySelector('.loginForm');


  async function studentLogin(loginValues) {
    try {
      const response = await fetch(`./backend/student/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginValues),
      });
      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.description);
        return;
      }
      hideloader();
      if (resData.status == 0) {
        sessionStorage.setItem('user', JSON.stringify(resData.user));
        console.log(resData.user);
        swal('Success', resData.message, 'success');

        window.location.replace('student/dashboard.html');
      } else {
        swal('Oops', resData.message, 'error');
      }
    } catch (error) {
      console.log(error);
      
      hideloader();
      swal('Oops', error, 'error');
    }
  }

  async function teacherLogin(loginValues) {
    try {
      const response = await fetch(`./backend/teacher/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginValues),
      });
      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.description);
        return;
      }
      hideloader();
      if (resData.status == 0) {
        sessionStorage.setItem('user', JSON.stringify(resData.user));
        console.log(resData.user);
        swal('Success', resData.message, 'success');
        window.location.replace('teacher/dashboard.html');
      } else {
        swal('Oops', resData.message, 'error');
      }
    } catch (error) {
      console.log(error);
    }
  }
function handleSubmit(e) {
  e.preventDefault();
  const username = $('#InputUsername').val()
const password = $('#InputPassword').val()
const select = $('#select').val()


const loginValues = { username: username, password: password };


  showloader();
  select == 'Teacher' ? teacherLogin(loginValues) : studentLogin(loginValues);
  
}

form.addEventListener('submit', handleSubmit);
