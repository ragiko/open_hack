<?php
$app = include __DIR__ .'/../src/bootstrap.php';

// use Slim\Slim;

// アプリケーションの構築
$app->view($app->container['twig']($app->request(), $app->router()));

// コントローラーを増やす場合はここにrequireでコントローラーへのパスを追加する
require  __DIR__ . '/../src/app/welcome.php';
require  __DIR__ . '/../src/app/document.php';
require  __DIR__ . '/../src/app/user.php';
require  __DIR__ . '/../src/app/api.php';

$app->run();

