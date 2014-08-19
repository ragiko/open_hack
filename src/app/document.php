<?php
$app->get('/doc', function () use ($app) {
        $app->render('doc/index.html.twig');
    })
->name('doc_top')
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
