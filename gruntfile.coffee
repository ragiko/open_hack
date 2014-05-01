module.exports = (grunt) ->
  grunt.loadNpmTasks 'grunt-bower-concat'
  grunt.loadNpmTasks 'grunt-browserify'
  grunt.initConfig
    bower_concat:
      all:
        dest: 'public_html/front/demo/vote-browserify/build/vendor.js'
        dependencies: 'underscore': 'jquery'
        mainFiles:
          'director': 'build/director.js'
        exclude: [
          'marked', 'moment', 'todomvc-common'
        ]
        bowerOptions:
          relative: false

    browserify:
      app:
        files:
          'public_html/front/demo/vote-browserify/build/app.js': [
            'public_html/front/demo/vote-browserify/src/app.js'
          ]
        options:
          transform: ['brfs']
    esteWatch:
      options:
        dirs: ['app/**/', 'test/**/']

  grunt.registerTask "build", ["bower_concat", "browserify"]
  grunt.registerTask "default", ["build"]
