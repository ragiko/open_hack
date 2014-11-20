<?php
/**
 * サンプル welcomeコントローラー
 */
$app->get('/text/signin', function () use ($app) {
        $app->render('text/signin.html.twig');
    })
    ->name('text-signin')
;

$app->get('/text/top', function () use ($app) {
        $app->render('text/top.html.twig');
    })
    ->name('text-top')
;

$app->get('/text/post', function () use ($app) {
        $app->render('text/top.html.twig');
    })
    ->name('text-post')
;


/**
 * Demo 用
$app->get('/post/:name', function ($name) use ($app) {
        // テンプレートでコードを表示するために
        $phpcode = $contents = highlight_file(__FILE__, TRUE);
        $twigcode = file_get_contents($app->container['twig.templateDir'] . '/top/hello.html.twig');
        $app->render('text/hello.html.twig', ['name' => $name, 'phpcode' => $phpcode, 'twigcode' => $twigcode]);
    })
    ->name('heljo2')
    ->conditions(['name' => '\w+'])
;
*/
