Vue.effect('fadein', {
  enter: function (el, insert, timeout) {
    $(el).addClass('animated fadeIn');
    insert(el);
  },
  leave: function (el, remove, timeout) {
    remove(el);
  }
});
