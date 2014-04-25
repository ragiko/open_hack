GroupWork ベースアプリ (VOYAGE GROUP)
===================================

このベースアプリはWebアプリケーション開発のひな形となる薄いサンプルアプリです。

## アプリケーション構成

* Slim2
* Twig
* Pimple2



## インストール

    $ make setup
    $ make install

## 設定

- DB設定 ... アプリ用 (`src/config.php`) と マイグレーションツール用 (`.dbup/properties.ini`)

## Databaseの初期化

    $make mig-up

## httpd.confの設定例

    <Directory /var/www/GroupWorkBase/public_html>
    Options Indexes FollowSymLinks +MultiViews
    AllowOverride All

    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^(.*)$ index.php [QSA,L]
    </Directory>

## 開発用組込みサーバーを起動

    $ make server

ホスト名、ポートを指定する場合

    $ make server HOST=localhost PORT=9999

ブラウザで http://localhost:9999/ にアクセスすればOK

## テスト実行

    $ make test

## インデントを整形

    $ make fixer



