<?php
if (session_status() == PHP_SESSION_NONE) {
  session_start();
}
// Set up some variables for CAS
$casService = 'https://login.marist.edu/cas';
$thisService = 'http://localhost:1337' . $_SERVER['PHP_SELF']; 

/*
* Check to see if there is a ticket in the GET request.
* CAS uses "ticket" for the service ticket. Bad choice of words, but
* it is what CAS uses.
*
* If the ticket exists, validate it with CAS. If not, redirect the user
* to CAS.
*
* Of course, you will want to hook this in with your application's
* session management system, i.e., if the user already has a session,
* you don't want to do either of these two things.
*
*/
if ($_SERVER["REQUEST_METHOD"] && $_GET["ticket"]) {
  if ($response = responseForTicket($_GET["ticket"])) {
    if ($cwid = uid($response)) {
      echo "The user is: $cwid\n";
      $dbname = 'databasename';
      $dbuser = 'webuser';
      $dbpass = 'password123';
      $dbhost = 'localhostmaybe';
      $connection = mysqli_connect($dbhost, $dbuser, $dbpass) or die("Unable to Connect to '$dbhost'");
      // Selecting Database
      $db = mysqli_select_db($connection, $dbname) or die("Could not open the db '$dbname'");
      // SQL Query To Fetch Complete Information Of User
      $ses_sql = mysqli_query($connection, "select cwid, folder from logins where cwid='$cwid' and isActive='Y' ");
      $row = mysqli_fetch_assoc($ses_sql);
      $login_session =$row['cwid'];
      $user_folder =$row['folder'];
      $_POST['username']=$cwid;
      $_POST['password']=$_GET["ticket"];
      $_SESSION['login_user']=$cwid; // Initializing Session ID
      $_SESSION['maristcas']=$_GET["ticket"];
      if(!isset($login_session)) { // NOT AUTHORIZED!
        mysqli_close($connection); // Closing Connection 
        echo "\nUnauthorized user!\n Redirecting to logout.\n";
        header("refresh: 3; url=../logout.php");
        //header('Location: ../logout.php'); // Redirecting To Home Page
      }
      else {
        echo "Authorized user!\n Redirecting to profile.";
        header("location: ../profile.php"); // Redirecting To Other Page
      }
    }
    else {
      echo "Could not get CWID from response.\n";
      echo $response;
    }
  }
  else {
    echo "The response was not valid.\n";
    echo $response;
  }
}
else {
   header("Location: $casService/login?service=$thisService");
}
 
 
/*
* Returns the CAS response if the ticket is valid, and false if not.
*/
function responseForTicket($ticket) {
   global $casService, $thisService;
 
   $casGet = "$casService/serviceValidate?ticket=$ticket&service=" . urlencode($thisService);
 
   // See the PHP docs for warnings about using this method:
   // http://us3.php.net/manual/en/function.file-get-contents.php
   $response = file_get_contents($casGet);
 
   if (preg_match('/cas:authenticationSuccess/', $response)) {
      return $response;
   }
   else {
      return false;
   }
}
 
/*
* Returns the UID from the passed in response, or it
* returns false if there is no UID.
*/
function uid($response) {
   $casUserArray = explode("@marist.edu", $response);
   if (is_array($casUserArray)) {
      $uid = substr($casUserArray[0], strlen($casUserArray)-8);
      if (is_numeric($uid)) {
         return $uid;
      }
   }
   return false;
}
 
?>
