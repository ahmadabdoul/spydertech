const formControl = document.querySelector('.inputForms');
const inputs = document.querySelectorAll('.form-control');
console.log(inputs);

function formSubmit(e) {
  e.preventDefault();

  const select = document.getElementById('select');
  const values = {
    fullname: document.getElementById('Inputtext1').value,
    email: document.getElementById('InputEmail1').value,
    username: document.getElementById('username').value,
    cellphone: document.getElementById('InputNumber').value,
    password: document.getElementById('InputPassword1').value,
  };

  if (select.value === 'Student') {
    console.log('Student page');
    registerStudent(values);
  } else {
    console.log('Teacher page');
    registerTeacher(values);
  }
}

async function registerStudent(values) {
  showloader();

  const url = localStorage.getItem('url');
  const response = await fetch(`./backend/student/register.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  const data = await response.json();
  hideloader();
  console.log(data);
  if(data.status == 0){
    sessionStorage.setItem('user', JSON.stringify(data.user));
    swal('Success', data.message, 'success');
    window.location.replace('student/dashboard.html');
  }else{
    swal('Oops', data.message, 'error');
  }

  // Handle the response data as needed


}

async function registerTeacher(values) {
  showloader();

  const url = localStorage.getItem('url');
  const response = await fetch(`./backend/teacher/register.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  const data = await response.json();
  console.log(data);
  hideloader();
  // Handle the response data as needed

  if(data.status == 0){
    sessionStorage.setItem('user', JSON.stringify(data.user));
    swal('Success', data.message, 'success');
    window.location.replace('teacher/dashboard.html');
  }else{
    swal('Oops', data.message, 'error');
  }

}


formControl.addEventListener('submit', formSubmit);
