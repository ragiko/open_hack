module.exports = ->
  'use strict';

  new Vue
    el: '#main'
    data:
      currentView: 'input'
      user:
        name: ''
        email: ''
        password: ''
        birthday: ''
      errors: {}
      hasError: false
    methods:
      # 確認画面
      confirm: (e) ->
        data = @$data
        data.hasError = false
        e.preventDefault()
        $.ajax
          type: 'PUT'
          url: '/api/sample/user'
          data: data.user
        .done (res) ->
          data.currentView = 'confirm'
        .fail (res) ->
          errors = $.parseJSON(res.responseText).data
          data.errors = errors
          data.hasError = true
      # 戻るボタン
      back: (e) ->
        @$data.currentView = 'input'
      # 登録処理
      add: (e) ->
        data = @$data
        e.preventDefault()
        $.ajax
          type: 'POST'
          url: '/api/sample/user'
          data: data.user
        .done (res) ->
          data.currentView = 'complete'
        .fail (res) ->
          errors = $.parseJSON(res.responseText).data
          data.errors = errors
          data.hasError = true
