<?php
use Respect\Validation\Validator as v;

$app->get('/user/login', function () use ($app) {
        $app->render('user/login.html.twig');
    })
->name('user_login')

;
$app->post('/user/login', function () use ($app) {
        $input = $app->request()->post();

        // 入力チェック
        // http://documentup.com/Respect/Validation/
        $inputValidator = v::arr()
        ->key('email', v::string()->setName('mailaddress')->notEmpty())
        ->key('password', v::string()->setName('password')->notEmpty())
        ;

        $errors = [];
        try {
            $inputValidator->assert($input);
        } catch (\InvalidArgumentException $e) {
            $errors = $e->findMessages([
                                           'mailaddress.notEmpty' => 'メールアドレスを入力してください',
                                           'password.notEmpty' => 'パスワードを入力してください',
                                           ]);
        }

        if (count($errors) === 0) {
            // ユーザーの存在チェック
            $repository = $app->container['repository.user'];
            $user = $repository->findByEmailPassword($input['email'], $input['password']);
            if (!$user) {
                $errors['form'] = 'メールアドレスまたはパスワードを確認してください';
                $app->render('user/login.html.twig', ['errors' => $errors, 'input' => $input]);
                $app->stop('メールアドレスまたはパスワードを確認してください');
            }
            $app->container['session']->set('isLogin', true);
            $app->container['session']->set('user.name', $user->name);
            $app->container['session']->set('user.id', $user->id);
            $app->redirect($app->urlFor('welcome'));
        }

        $app->render('user/login.html.twig', ['errors' => $errors, 'input' => $input]);

    })
->name('user_login_post')
;

$app->get('/user/logout', function () use ($app) {
        $app->container['session']->clear();
        $app->redirect($app->urlFor('user_login'));
    })
->name('user_logout')
;

$app->get('/user/register', function () use ($app) {
        $app->render('user/register.html.twig');
    })
->name('user_register')
;
$app->post('/user/register', function () use ($app) {
        $input = $app->request()->post();

        // ここでは上記コントローラーと異なり
        // バリデータをコントローラーの内部ではなく外部に委譲した実装例
        $validator = new \Vg\Validator\UserRegister();

        if ($validator->validate($input)) {
            $user = new \Vg\Model\User();
            $user->setProperties($input);

            $repository = $app->container['repository.user'];
            try {
                $repository->insert($user);
            } catch (Exception $e) {
                $app->halt(500, $e->getMessage());
            }

            $app->redirect($app->urlFor('user_login'));
        }

        $app->render('user/register.html.twig', ['errors' => $validator->errors(), 'input' => $input]);
    })
->name('user_register_post')
;

/**
 * ログインしていない場合はログイン画面にリダイレクト
 *
 * http://docs.slimframework.com/#Route-Middleware
 *
 * @param $session
 *
 * @return callable
 */
$redirectIfNotLogin = function ($session) {
    return function () use ($session) {
        if ( $session->get('isLogin') !== true ) {
            $app = \Slim\Slim::getInstance();
            $app->flash('error', 'Login required');
            $app->redirect($app->urlFor('user_login'));
        }
    };
};

$app->get('/user/edit', $redirectIfNotLogin($app->container['session']), function () use ($app) {
        $repository = $app->container['repository.user'];
        $user = $repository->findById($app->container['session']->get('user.id'));

        $app->render('user/edit.html.twig', ['input' => $user]);
    })
->name('user_edit')
;

$app->post('/user/update', $redirectIfNotLogin($app->container['session']), function () use ($app) {
        $input = $app->request()->post();

        $validator = new \Vg\Validator\UserEdit();

        if ($validator->validate($input)) {
            $repository = $app->container['repository.user'];
            $user = $repository->findById($app->container['session']->get('user.id'));
            $user->name = $input['name'];
            $user->email = $input['email'];
            $user->birthday = $input['birthday'];

            try {
                $repository->update($user);
            } catch (Exception $e) {
                $app->halt(500, $e->getMessage());
            }

            $app->container['session']->set('user.name', $user->name);
            $app->redirect($app->urlFor('welcome'));
        }

        $app->render('user/edit.html.twig', ['errors' => $validator->errors(), 'input' => $input]);
    })
->name('user_update')
;
