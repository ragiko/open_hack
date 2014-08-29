GroupWork ベースアプリ (VOYAGE GROUP)
===================================
aaaaaa
このベースアプリはWebアプリケーション開発のひな形となる薄いサンプルアプリです。

## 動作環境

* PHP 5.4以上
* npm
* mysql
* curl (パッケージインストールのため)

## 主要なアプリケーション構成

* Slim2
* Twig
* PHPUnit

* Vue.js
* Browserify
* director
* mocha
* PhantomJS

## インストール

    $ make setup
    $ make install
    $ make copy-db-config

## 設定

- DB設定 ... アプリ用 (`src/config.php`) と マイグレーションツール用 (`.dbup/properties.ini`)
    - `make copy-db-config` でひな形ファイルがコピーされるので、環境にあわせて書き換えてください

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

## インストールされたJavaScriptのライブラリを確認

bowerを使って依存管理されています。詳しは Makefile参照

    $ make list

## 外部JavaScriptライブラリを追加する場合

    $ make bower COMMAND=search ARG=power
    /var/www/GroupWorkBase/node_modules/bower/bin/bower search power
    Search results:

        jquery-powertip git://github.com/stevenbenner/jquery-powertip.git
        empower git://github.com/twada/empower.git
        espower git://github.com/twada/espower.git
        power-assert-formatter git://github.com/twada/power-assert-formatter.git
        power-assert git://github.com/twada/power-assert.git
        powerange git://github.com/abpetkov/powerange.git
        jquery-power-plugin git://github.com/3den/jquery-power-plugin.git
        espower-loader git://github.com/twada/espower-loader.git
        f-empower git://github.com/ognivo/f-empower.git

    $ make bower COMMAND=install ARG=power-assert

## テスト実行

    $ make test

ファイルの更新を検知してテストを自動実行させるためにはwatchを実行しておくだけです。

    $ make watch


## インデントを整形

    $ make fixer

## フロントエンドアプリケーション

Vue.js と director を使った フロントエンドアプリケーションについては
サーバー起動後に ブラウザで http://localhost:9999/front/ にアクセスすればチュートリアルを確認できます

デモアプリを動かすためには

    $ make build

を実行する必要があります

フロントエンドのテストは

    $ make test-front

で実行されます。また、バックエンドと同じく

    $ make watch

でファイル更新を検知し js のテストが実行されるようになっています。
(ただし、現在の設定はデモアプリのテスト `/public_html/front/demo/vote-browserify/` のみが検知対象。詳しくは gruntfile.coffeeを参照)

## ライブラリを削除したい場合

一度インストールされたライブラリは管理されなくなるだけでダウンロードして展開されたファイルは残っています。
初期状態に戻して再インストールすれば綺麗な状態でインストールが出来ます。
その場合は

    $ make clean

をしたあとに、*.jsonを更新し

    $ make install

を実行してください
