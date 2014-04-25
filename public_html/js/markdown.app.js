(function(){
  "use strict";

    // Markdownのドキュメント
    var DocumentModel = Backbone.Model.extend({
        body: '',
        initialize: function() {
            this.body = $('p#document').html();
        }
    });

    // Markdownで表示View
    var MarkdownView = Backbone.View.extend({
        initialize: function () {
            this.render();
        },
        render: function() {
            this.el = markdown.toHTML(this.model.body);
            $('p#document').html(this.el);
            return this;
        }
    });

    // そのまま表示するView
    var RawView = Backbone.View.extend({
        initialize: function () {
            this.render();
        },
        render: function() {
            this.el = this.model.body;
            $('p#document').html(this.el.replace(/\n/g, '<br>'));
            return this;
        }
    });

    var MarkdownDocument = new DocumentModel({});
    var MarkdownDocumentView =  new MarkdownView({model: MarkdownDocument});
    //var RawDocumentView =  new RawView({model: MarkdownDocument});
})();
