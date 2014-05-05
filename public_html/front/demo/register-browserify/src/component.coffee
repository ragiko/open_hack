  fs =  require('fs');
  Vue.component 'input',
    template: fs.readFileSync(__dirname + '/components/input/template.html', 'utf-8')
  Vue.component 'confirm',
    template: fs.readFileSync(__dirname + '/components/confirm/template.html', 'utf-8')
  Vue.component 'complete',
    template: fs.readFileSync(__dirname + '/components/complete/template.html', 'utf-8')
