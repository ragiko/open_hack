<?php
$app->get('/doc', function () use ($app) {
        $app->render('doc/index.html.twig');
    })
->name('doc_top')
;

$app->get('/doc/sweet', function () use ($app) {
        $app->render('doc/gacha.html.twig');
    })
->name('sweet')
;

$app->get('/doc/json', function () use ($app) {
        $app->render('doc/gacha.json');
    })
->name('json')
;

$app->get('/doc/result', function () use ($app) {
        $app->render('doc/result.json');
    })
->name('result')
;

$app->get('/doc/bootstrap', function () use ($app) {
        $app->render('doc/bootstrap.html.twig');
    })
->name('doc_bootstrap')
;

$app->get('/doc/basic', function () use ($app) {
        $markdown = file_get_contents(__DIR__. '/../../docs/basic.md');
        $app->render('doc/markdown.html.twig', ['markdown' => $markdown]);
    })
->name('doc_basic')
;

$app->get('/doc/extends', function () use ($app) {
        $markdown = file_get_contents(__DIR__. '/../../docs/extend.md');
        $app->render('doc/markdown.html.twig', ['markdown' => $markdown]);
    })
->name('doc_extend')
;
