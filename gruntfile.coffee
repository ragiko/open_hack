module.exports = (grunt) ->
  grunt.loadNpmTasks 'grunt-bower-concat'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-este-watch'
  grunt.initConfig
    bower_concat:
      all:
        dest: 'public_html/front/demo/vote-browserify/build/vendor.js'
        dependencies: 'underscore': 'jquery'
        mainFiles:
          'director': 'build/director.js'
        exclude: [
          'marked', 'moment', 'todomvc-common', 'animate.css'
        ]
        bowerOptions:
          relative: false

    browserify:
      app:
        files:
          'public_html/front/demo/vote-browserify/build/main.js': [
            'public_html/front/demo/vote-browserify/src/main.js'
          ]
        options:
          transform: ['brfs']
    copy:
      css:
       expand: true
       cwd: 'public_html/bower_components/'
       flatten: true
       src: [
        'animate.css/animate.min.css'
        'bootstrap/dist/css/bootstrap.css'
        ]
       dest: 'public_html/front/demo/vote-browserify/build/css/'
        
    esteWatch:
      options:
        dirs: ['public_html/front/demo/vote-browserify/src/**']
      js: () -> 'browserify'

  grunt.registerTask "build", ["bower_concat", "copy:css", "browserify"]
  grunt.registerTask "watch", ["esteWatch"]
  grunt.registerTask "default", ["build"]
