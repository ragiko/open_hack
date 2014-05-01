Vue.js + browserify パターン
===================================

browserify を使うことで node.js の組込みモジュールをクライアントサイドのjsで利用できます。
今回はテンプレートを `fs.readFileSync` で読み込めるようにするために利用しています。

また、browserify の build は Gruntで行っています。
Gruntはcoffeeでも記述できるのでcoffeeスクリプトで記述しています。

また、bowerで管理している外部ライブラリも`vendor.js`としてまとめる bower_concat というタスクを利用しています。

## コンパイル

    $ make grunt

## 構成
```
.
├── build ... bower_concat と browesrify でビルドされたjsファイル
└── src ... 今回のアプリの元ファイル置き場
    └── components ... コンポーネント毎のテンプレートを配置
       ├── edit
       ├── list
       ├── new
       └── notfound

```

## 外部ライブラリ

* director.js
  * ルーティングライブラリ

## リンク

* http://browserify.org/
* http://gruntjs.com/
* https://www.npmjs.org/package/grunt-bower-concat
* http://coffeescript.org/
* http://nodejs.jp/nodejs.org_ja/docs/v0.4/api/fs.html