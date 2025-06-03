$('#logout').click(function (e) {
e.preventDefault();
sessionStorage.clear();
console.log('Logged out');
window.location.replace("../index.html");
});