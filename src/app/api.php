<?php
/**
 * サンプル API コントローラー
 */

$jsonResponse = $container['response.json']($app->response);

/**
 * ユーザー一覧
 */
$app->get('/api/sample/users', function() use ($jsonResponse) {
        $data = [
            ['name' => 'taro', 'email' => 'taro@example.com'],
            ['name' => 'hanako', 'email' => 'hanako@example.com'],
            ];

        $jsonResponse($data);
    })
    ->name('api_sample_users')
;
