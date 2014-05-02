Vue.js + browserify パターン
===================================

browserify を使うことで node.js の組込みモジュールをクライアントサイドのjsで利用できます。
今回はテンプレートを `fs.readFileSync` で読み込めるようにするために利用しています。

また、browserify の build は Gruntで行っています。
Gruntはcoffeeでも記述できるのでcoffeeスクリプトで記述しています。

また、bowerで管理している外部ライブラリも`vendor.js`としてまとめる bower_concat というタスクを利用しています。

`main.js` で、エフェクト、コンポーネント、アプリ、ルーティングを読み込みアプリケーションの構成を作っています。

毎回手動でビルドするのは面倒なので、ファイル検知し自動で再ビルドするようにタスクを用意しています。(make watch)

また、animate.css を使い、v-effect でページ遷移時にアニメーションさせるように書いています。詳しくは src/effect.js を参照。

## ビルド

    $ make grunt

## js変更検知し自動ビルド

    $ make watch

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
* http://daneden.github.io/animate.css/