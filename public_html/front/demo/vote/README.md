Vue.js + director.js パターン
===================================

director.js を使い、ページ遷移をvue.jsで作ったサンプルです。
シングルページアプリケーションなので、ページの読み込みは1度だけなので、要素変更追加などはリロードしないかいぎり反映されている状態を維持します。

## viewの切り替え

scriptタグでtypeに"text/x-template"を指定することで通常ではブラウザに無視される内容を用意し、currentViewの内容をdirector.jsで切り替えることで画面遷移を実現しています。


## 外部ライブラリ

* director.js