Vue.js + component パターン
===================================

ここでいうcomponentはvue.jsのコンポーネントのことではなく、パッケージマネジメントツールのcomponentのことです。

`component` は component.json にjs,css,htmlを記述し、より小さなコンポーネント毎にアプリケーションを構築していくパターンです。ライブラリの依存関係も component.json で解決します。

今回であれば、vue.jsの各componentも component.jsonで管理しています。

## コンパイル

    $ make component

## 構成
```
.
├── build ... component build で作成されたjs, css などの出力先
├── components ... component install でインストールされた外部ライブラリ
└── lib ... 今回のアプリの元ファイル置き場
    ├── components ... コンポーネント毎にディレクトリを分けてそれぞれを別のcomponentとして管理
    │   ├── edit
    │   ├── list
    │   ├── new
    │   └── notfound
    └── styles ... main.cs 置き場
```

## 外部ライブラリ

* page.js
  * クライアントサイドのルーターとしてcomponentで利用できるようになっていたため利用。directorと同じ役割

## リンク

* http://vuejs.org/guide/application.html
* https://github.com/component/component
* https://github.com/component/guide/blob/master/component/getting-started.md