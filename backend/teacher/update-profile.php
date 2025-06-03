<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';
// Initialize variables
$name = '';
$userId = '';
$username = '';
$email = '';
$cellphone = '';
$avatar = '';
$response = array();



if(isset($_POST['name']) || isset($_GET['name'])){
  $name = isset($_POST['name']) ? mysql_entities_fix_string($conn, $_POST['name']) : mysql_entities_fix_string($conn, $_GET['name']);
  $userId = isset($_POST['user_id']) ? mysql_entities_fix_string($conn, $_POST['user_id']) : mysql_entities_fix_string($conn, $_GET['user_id']);
  $username = isset($_POST['username']) ? mysql_entities_fix_string($conn, $_POST['username']) : mysql_entities_fix_string($conn, $_GET['username']);
  $email = isset($_POST['email']) ? mysql_entities_fix_string($conn, $_POST['email']) : mysql_entities_fix_string($conn, $_GET['email']);
  $cellphone = isset($_POST['cellphone']) ? mysql_entities_fix_string($conn, $_POST['cellphone']) : mysql_entities_fix_string($conn, $_GET['cellphone']);
  $image = isset($_FILES) ? $_FILES['image'] : '';
if($image == ''){
    $response['status'] = 1;
    $response['message'] = 'Image not provided.';

    echo json_encode($response);
    exit();
    

}
  //file upload
    $target_dir = "../uploads/";
    $target_file = $target_dir . basename($_FILES["image"]["name"]);
    $uploadOk = 1;
    $imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
    if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg") {
      $response['status'] = 1;
      $response['message'] = 'Sorry, only JPG, JPEG, PNG files are allowed.';
      $uploadOk = 0;
    }else{
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
            $avatar = "uploads/".basename( $_FILES["image"]["name"]);
        } else {
            $response['status'] = 1;
            $response['message'] = 'Sorry, there was an error uploading your file.';
            $uploadOk = 0;
        }
        }
    $sql = "UPDATE  `teachers` SET `name`='$name',`username`='$username',`email`='$email',`cellphone`='$cellphone',`avatar`='$avatar' WHERE `id` = '$userId'";
    $result = mysqli_query($conn, $sql) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of questions and answers.')));

    if($result){
      $response['status'] = 0;
      $response['message'] = 'Profile updated successfully.';

      $response['user'] = array(
        'id' => $userId, //added this line to get the id of the user
        'name' => $name,
        'username' => $username,
        'email' => $email,
        'cellphone' => $cellphone,
        'avatar' => $avatar
      );
    }else{
        $response['status'] = 1;
        $response['message'] = 'Error occurred during update of profile.';

        }
}else{
    $response['status'] = 1;
    $response['message'] = 'Info not provided.';
    }

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

mysqli_close($conn);





