let user = sessionStorage.getItem('user');

user = JSON.parse(user);

name = document.getElementById('name').value = user.name;
username = document.getElementById('username').value = user.username;
email = document.getElementById('email').value = user.email;
cellphone = document.getElementById('cellphone').value = user.cellphone;
avatar = $('#profileimg').attr('src', user.avatar);

const url = localStorage.getItem('url');
$('#formFileLg').on('change', () => {
  const file = formFileLg.files[0];
  const objectURL = URL.createObjectURL(file);
  $('#profileimg').attr('src', objectURL);
});

$('#update').on('click', (e) => {
  e.preventDefault();
  showloader();

  const profileObj = {
    user_id: user.id,
    name: $('#name').val(),
    username: $('#username').val(),
    email: $('#email').val(),
    cellphone: $('#cellphone').val(),
  };

  const formData = new FormData();
  formData.append('image', document.getElementById('formFileLg').files[0]);

  // Append profileObj properties to formData
  Object.entries(profileObj).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const requestOptions = {
    method: 'POST',
    body: formData,
  };

  fetch(`${url}student/update-profile.php`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      hideloader();
      if (result.status === 0) {
        sessionStorage.setItem('user', JSON.stringify(result.user));
        swal('Success', result.message, 'success');
      } else {
        swal('Oops', result.message, 'error');
      }
    })
    .catch((error) => {
      console.error(error);
      hideloader();
      swal('Oops', 'An error occurred', 'error');
    });
});
