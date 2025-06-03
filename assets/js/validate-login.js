// Check if user is logged in
if (!sessionStorage.getItem('user')) {
  console.log('User not logged in');
  swal('Session Expired', 'Please login again', 'error')
    // Redirect to index.html
    window.location.replace = '../index.html';
  }
  