// Load plugins
var gulp = require('gulp');

gulp.task('default', function() {
  var rename = require('gulp-rename');
  var ngAnnotate = require('gulp-ng-annotate');
  var uglify = require('gulp-uglify');

  var p = gulp.src(['rect-ng*.js'])
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(__dirname));
});
