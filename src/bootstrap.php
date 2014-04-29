<?php
/**
 * このファイルはアプリケーションで利用するライブラリや設定項目などを定義する場所
 */
require __DIR__ .'/../vendor/autoload.php';

$container = include __DIR__ . '/config.php';

// Twig
$container['twig'] = $container->protect(function($request, $router) use ($container) {

        $twig = new \Slim\Views\Twig;
        $twig->twigTemplateDirs = $container['twig.templateDir'];
        $env = $twig->getEnvironment();
        // asset function
        $env->addFunction(new Twig_SimpleFunction('asset', function ($path) use ($request) {
                return $request->getRootUri() . '/' .  trim($path, '/');
            }));
        // urlFor function
        $env->addFunction(new Twig_SimpleFunction('urlFor', function ($name, $params = []) use ($router) {
                return $router->urlFor($name, $params);
            }));
        // debug
        $env->addFunction(new Twig_SimpleFunction('debug', function (){
                echo "<pre>";
                debug_print_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
                echo "</pre>";
            }));
        // global session
        $env->addGlobal('session', $container['session']);

        return $twig;
    });

// データベース PDO
$container['db'] = function($c){
        return \Vg\Database::connection($c['db.host'], $c['db.database'], $c['db.user'], $c['db.password']);
    };

// セッション
$container['session'] = function() {
        return new \Vg\Session();
    };

// ユーザーリポジトリ
$container['repository.user'] = function($c){
        return new \Vg\Repository\UserRepository($c['db']);
    };

/**
 * JSON のレスポンス
 */
$container['response.json'] = $container->protect(function(\Slim\Http\Response $response) {
        return function($data, $status = 200) use ($response){
            $response->setStatus($status);
            $response->headers->set('Content-Type', 'application/json');
            // Encode <, >, ', &, and " for RFC4627-compliant JSON, which may also be embedded into HTML.
            $jsonBody = json_encode(['data' => $data], JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);
            $response->setBody($jsonBody);
        };
    });


return $container;




