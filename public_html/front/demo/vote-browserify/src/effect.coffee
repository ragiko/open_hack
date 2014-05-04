Vue.effect  'fadein',
  enter: (el, insert, timeout) ->
    $(el).addClass 'animated fadeIn'
    insert el
  leave: (el, remove, timeout) ->
    remove el

