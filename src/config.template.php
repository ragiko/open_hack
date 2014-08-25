<?php
require __DIR__ .'/../vendor/autoload.php';
/**
 * このファイルでコンテナに設定項目を定義する
 */

$app = new \Slim\Slim();

/**
 * ここでアプリケーションが利用する項目を設定する
 */

// DB設定
$app->container['db.host']     = 'localhost';
$app->container['db.database'] = 'groupwork';
$app->container['db.user']     = 'demouser';
$app->container['db.password'] = 'demopass';

// twig設定
$app->container['twig.templateDir'] = __DIR__ . '/views';

return $app;
