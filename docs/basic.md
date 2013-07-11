## GroupWorkBase の基本について

GroupWorkBase は Slim2 という PHP製Webアプリケーション用 マイクロフレームワークで構築されています。

### フロー

以下のフローでアプリケーションが動作します。

- ブラウザからのリクエストは `public_html/index.php` で受ける
- `src/boostrap.php` が読み込まれる
 - `src/config.php` の設定項目を取り込む
 - `src/bootstrap.php` でサービスコンテナ(Pimple)に 各ライブラリを定義、依存関係を登録する
- `public_html/index.php` で `Slim` の拡張設定を行う
 - ここでテンプレートエンジン(Twig) を利用するための設定を Slim に行う
- 各アプリケーションのファイルのパスがリストされているので、そのファイルを読み込む
 - アプリケーションのファイルは `src/app/xxx.php` にあります
- ルーティングにマッチしたアプリケーションの無名関数が処理される
- `render` メソッドにテンプレートのパスを指定し、レンダリングを実行
 - テンプレートのパスは `src/vews`

### テンプレートエンジン

GroupWorkBase では Twig をテンプレートエンジンとして利用しています。
TwigとSlimとの連携は Slim に用意されている拡張機能パッケージを使うことで実装しています。

### サンプルアプリ

GroupWorkBase には "会員登録" "ログイン/ログアウト" "登録内容変更" の簡単な実装が組み込まれています。
実際に動かしてみて `src/app/user.php` のコードを参考に勉強してみてください。

### Backbone.js について

jQueryそのままではなく、Backbone.jsを使うこともできます。
たとえば、このページのドキュメントは Markdown形式で書かれていて、JavaScriptのライブラリでHTMLに変換しています。
その処理をjQueryそのままではなく、Backbone.jsで書いています。
