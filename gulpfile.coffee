gulp    = require 'gulp'

coffee  = require 'gulp-coffee'
uglify  = require 'gulp-uglify'
gutil   = require 'gulp-util'
rename  = require 'gulp-rename'
watch   = require 'gulp-watch'
p       = require './package.json'
exec    = require('child_process').exec

js_in        = './src/**/*.js'
coffee_in    = './src/**/*.coffee'

js_out       = './dist/js/'
coffee_out   = './dist/shared/'

test_in  = './spec/javascripts/coffee/*'
test_out = './spec/javascripts/shared/'

gulp.task 'default', ->
  gulp.start 'build_coffee'
  gulp.watch './**/*.coffee', ->
    gulp.start 'build_coffee'
    gulp.start 'build_rjs'

  gulp.watch js_in, ->
    gulp.start 'copy_js'
    gulp.start 'build_rjs'

# important we build r.js build AFTER coffee assets have compiled or been transferred to dist
gulp.task 'build_rjs', ['build_coffee', 'copy_js'], ->
  exec "./node_modules/requirejs/bin/r.js -o require.build.js optimize=none", ->
    console.log 'Build success - package can be found at ./dist/jquery-moving-service.js'

gulp.task 'copy_js', ->
  gulp.src(js_in).pipe(gulp.dest(js_out))

gulp.task 'build_coffee', ->
  try
    gulp.src(coffee_in)
      .pipe(coffee().on('error', gutil.log))
      .pipe(gulp.dest(coffee_out))
    gulp.start 'build_rjs'
    gulp.src(test_in)
      .pipe(coffee())
      .pipe(gulp.dest(test_out))
  catch e
    console.log e

# release tasks
require('gulp-release-tasks')(gulp)
