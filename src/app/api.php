<?php
/**
 * サンプル API コントローラー
 */

// json response を返すために用意したメソッドの準備
$jsonResponse = $app->container['response.json']($app->response);

// AJAXのリクエスト以外は400エラー
$haltUnlessAjaxRequest = function () use ($app) {
    if (!$app->request->isAjax()) {
        $app->halt('denied', 400);
    }
};

/**
 * ユーザー一覧
 */
$app->get('/api/sample/users', $haltUnlessAjaxRequest, function () use ($jsonResponse) {
        $data = [
            ['name' => 'taro', 'email' => 'taro@example.com'],
            ['name' => 'hanako', 'email' => 'hanako@example.com'],
            ];

        $jsonResponse($data);
    });

$errorIfInvalidNewUser = function ($input) use ($app, $jsonResponse) {
    $validator = new \Vg\Validator\UserRegister();
    if (!$validator->validate($input)) {
        $jsonResponse($validator->errors(), 400);
        $app->stop();
    }

    return true;
};

//fishgacgajson

$app->get('/api/fishgachas', $haltUnlessAjaxRequest, function () use ($jsonResponse) {
        $data = [
            ['key' => 'ぶり', 'value' => '0'],
            ['key' => 'かに', 'value' => '0'],
            ['key' => 'えび', 'value' => '0'],
            ['key' => 'さわら', 'value' => '0'],
            ['key' => 'うに', 'value' => '0'],
            ['key' => 'さざえ', 'value' => '0'],
            ['key' => 'マグロ', 'value' => '0'],
            ['key' => 'さんま', 'value' => '0'],
            ['key' => 'タイ', 'value' => '0'],
            ['key' => 'イカ', 'value' => '0'],
            ['key' => 'たこ', 'value' => '0'],
            ['key' => 'メガマウス', 'value' => '0'],
            ['key' => 'リュウグウノツカイ', 'value' => '0']
            ];

        $jsonResponse($data);
    });


/**
 * API ユーザー登録のバリデーションサンプル(確認画面)
 */
$app->put('/api/sample/user', $haltUnlessAjaxRequest, function () use ($app, $jsonResponse, $errorIfInvalidNewUser) {

        $input = $app->request()->post();
        $errorIfInvalidNewUser($input);
        $jsonResponse([]);
    });

/**
 * API ユーザー登録のサンプル
 */
$app->post('/api/sample/user', $haltUnlessAjaxRequest, function () use ($app, $jsonResponse, $errorIfInvalidNewUser) {

        $input = $app->request()->post();
        $errorIfInvalidNewUser($input);

        $user = new \Vg\Model\User();
        $user->setProperties($input);

        $repository = $app->container['repository.user'];
        try {
            $repository->insert($user);
        } catch (Exception $e) {
            $jsonResponse($e->getMessage(), 500);
            $app->stop();
        }
        $jsonResponse([]);
    });

/**
 * アクセスしているユーザ名を返すAPI
 * GroupWorkBase Front の右上にユーザー名を表示する処理で使用
 */
$app->get('/api/sample/me', $haltUnlessAjaxRequest, function () use ($jsonResponse, $app) {
        $repository = $app->container['repository.user'];
        $user = $repository->findById($app->container['session']->get('user.id'));
        if ($user->id) {
            $jsonResponse($user->name);
        } else {
            // ユーザーが取得できないときは 401 Unauthorized を返す
            $jsonResponse([], 401);
        }
    });
