<?php
  session_set_cookie_params(time() + (20 * 365 * 24 * 60 * 60), '/', 'localhost', false);
  session_save_path("/tmp/session");
  session_start();
?>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>Treasure</title>
</head>
<body>

<p>あなたは今回このページに訪れるのは
<?php
  if (isset($_SESSION['cnt'])) {
    echo $_SESSION['cnt'], " 回目ですね。";
  } else {
    $_SESSION['cnt'] = 1;
    echo "始めてですね（あるいはクッキーが保存されていませんね）。";
  }
  $_SESSION['cnt']++;
?>
</p>

</body>
</html>