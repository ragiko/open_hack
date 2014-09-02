module.exports = (grunt) ->
  grunt.loadNpmTasks 'grunt-bower-concat'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-este-watch'
  grunt.loadNpmTasks 'grunt-mocha-phantomjs'
  grunt.loadNpmTasks 'grunt-shell';
  
  grunt.initConfig
    app_path: 'public_html/front/demo/vote-browserify'
    app2_path: 'public_html/front/demo/register-browserify'
    bower_concat:
      app:
        dest: '<%= app_path %>/build/vendor.js'
        dependencies: 'underscore': 'jquery'
        mainFiles:
          'director': 'build/director.js'
        exclude: [
          'marked', 'moment', 'todomvc-common', 'animate.css'
        ]
        bowerOptions:
          relative: false
      app2:
        dest: '<%= app2_path %>/build/vendor.js'
        dependencies: 'underscore': 'jquery'
        exclude: [
          'marked', 'moment', 'todomvc-common', 'animate.css', 'director'
        ]
        bowerOptions:
          relative: false
    browserify:
      app:
        files:
          '<%= app_path %>/build/main.js': [
            '<%= app_path %>/src/main.coffee'
          ]
        options:
          transform: ['coffeeify', 'brfs']
      test:
        files:
          '<%= app_path %>/test/test.js': [
            '<%= app_path %>/test/test.coffee'
          ]
        options:
          transform: ['coffeeify', 'brfs', 'espowerify']
      app2:
        files:
          '<%= app2_path %>/build/main.js': [
            '<%= app2_path %>/src/main.coffee'
          ]
        options:
          transform: ['coffeeify', 'brfs']
    copy:
      app:
       expand: true
       cwd: 'public_html/bower_components/'
       flatten: true
       src: [
        'animate.css/animate.min.css'
        'bootstrap/dist/css/bootstrap.css'
        ]
       dest: '<%= app_path %>/build/css/'
      app2:
       expand: true
       cwd: 'public_html/bower_components/'
       flatten: true
       src: [
        'animate.css/animate.min.css'
        'bootstrap/dist/css/bootstrap.css'
        ]
       dest:  '<%= app2_path %>/build/css/'
        
    esteWatch:
      options:
        dirs: [
           'src/**/',
           'tests/**/',
          ]
      php: -> 'shell:phpunit'

    mocha_phantomjs:
      options:
        reporter: 'spec'
      all: ['<%= app_path %>/test/test.html']

    shell:
      phpunit:
        command: 'make test'

  grunt.registerTask "build", ["bower_concat", "copy", "browserify"]
  grunt.registerTask "test", ["mocha_phantomjs"]
  grunt.registerTask "watch", ["esteWatch"]
  grunt.registerTask "default", ["build"]
