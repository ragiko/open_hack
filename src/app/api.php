<?php
/**
 * サンプル API コントローラー
 */

// json response を返すために用意したメソッドの準備
$jsonResponse = $container['response.json']($app->response);

// AJAXのリクエスト以外は400エラー
$haltUnlessAjaxRequest = function() use ($app){
    if (!$app->request->isAjax()) {
        $app->halt('denied', 400);
    }
};

/**
 * ユーザー一覧
 */
$app->get('/api/sample/users', $haltUnlessAjaxRequest, function() use ($jsonResponse) {
        $data = [
            ['name' => 'taro', 'email' => 'taro@example.com'],
            ['name' => 'hanako', 'email' => 'hanako@example.com'],
            ];

        $jsonResponse($data);
    });

/**
 * API ユーザー登録のサンプル
 */
$app->post('/api/sample/user', $haltUnlessAjaxRequest, function() use ($app, $container, $jsonResponse) {

        $input = $app->request()->post();
        $validator = new \Vg\Validator\UserRegister();

        if ($validator->validate($input)) {
            $user = new \Vg\Model\User();
            $user->setProperties($input);

            $repository = $container['repository.user'];
            try {
                $repository->insert($user);
            } catch (Exception $e) {
                $jsonResponse($e->getMessage(), 500);
                $app->stop();
            }
            $jsonResponse([]);
            $app->stop();
        }
        // validation error
        $jsonResponse($validator->errors(), 403);
    });
