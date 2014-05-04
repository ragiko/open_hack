module.exports = ->
  'use strict';

  new Vue
    el: '#main',
    data:
      currentView: 'list',
      items: [
        {id: 1, title: 'TODOアプリ', like: 0},
        {id: 2, title: 'BBSアプリ', like: 5},
        {id: 3, title: 'Twitterアプリ', like: 10}
    ]
    methods:
      init: ->
        title: ''
      vote: (id, vm) ->
        item = _.findWhere @$data.items, {id: id}
        item.like += 1
      update: (item) ->
        window.location.href = '#/';
      add: (item) ->
        items = @$data.items;
        latestItem = _.max items, (item) -> item.id
        newItem = 
          id: Number(latestItem.id) + 1,
          title: item.title,
          like: 0
        items.push(newItem)
        window.location.href = '#/'
      animate: (vm) ->
        $(vm.$el).addClass('animated flash').one 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', ->
          $(@).removeClass('animated flash')
