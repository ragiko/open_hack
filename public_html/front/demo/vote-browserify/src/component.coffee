  fs =  require('fs');
  Vue.component 'list',
    template: fs.readFileSync(__dirname + '/components/list/template.html', 'utf-8')
  Vue.component 'new',
    template: fs.readFileSync(__dirname + '/components/new/template.html', 'utf-8')
  Vue.component 'edit',
    template: fs.readFileSync(__dirname + '/components/edit/template.html', 'utf-8')
