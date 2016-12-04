var gulp = require('gulp'),
  gutil = require('gulp-util'),
  plumber = require('gulp-plumber'),
  rimraf = require('gulp-rimraf'),
  rename = require('gulp-rename'),
  connect = require('gulp-connect'),
  browserify = require('gulp-browserify'),
  uglify = require('gulp-uglify'),
  jade = require('gulp-jade'),
  stylus = require('gulp-stylus'),
  autoprefixer = require('gulp-autoprefixer'),
  csso = require('gulp-csso'),
  through = require('through'),
  ghpages = require('gh-pages'),
  path = require('path'),
  fs = require('fs'),
  isDist = process.argv.indexOf('serve') === -1;

var distDir = 'dist';
var namespace;
try {
  namespace = fs.readFileSync('.namespace', 'utf-8').trim();
} catch (e) {}
if (namespace) {
  distDir = path.join(distDir, namespace);
}

function distpath(pathname) {
  return pathname ? path.join(distDir, pathname) : distDir;
}

function gdest(pathname) {
  return gulp.dest(distpath(pathname));
}

function gsrc(pathname) {
  return gulp.src(distpath(pathname));
}

gulp.task('js', ['clean:js'], function() {
  return gulp.src('src/scripts/main.js')
    .pipe(isDist ? through() : plumber())
    .pipe(browserify({ transform: ['debowerify'], debug: !isDist }))
    .pipe(isDist ? uglify() : through())
    .pipe(rename('build.js'))
    .pipe(gdest('build'))
    .pipe(connect.reload());
});

gulp.task('html', ['clean:html'], function() {
  return gulp.src('src/index.jade')
    .pipe(isDist ? through() : plumber())
    .pipe(jade({ pretty: true }))
    .pipe(rename('index.html'))
    .pipe(gdest())
    .pipe(connect.reload());
});

gulp.task('css', ['clean:css'], function() {
  return gulp.src('src/styles/main.styl')
    .pipe(isDist ? through() : plumber())
    .pipe(stylus({
      // Allow CSS to be imported from node_modules and bower_components
      'include css': true,
      'paths': ['./node_modules', './bower_components']
    }))
    .pipe(autoprefixer('last 2 versions', { map: false }))
    .pipe(isDist ? csso() : through())
    .pipe(rename('build.css'))
    .pipe(gdest('build'))
    .pipe(connect.reload());
});

gulp.task('images', ['clean:images'], function() {
  return gulp.src('src/images/**/*')
    .pipe(gdest('images'))
    .pipe(connect.reload());
});

gulp.task('clean', function() {
  return gsrc()
    .pipe(rimraf());
});

gulp.task('clean:html', function() {
  return gsrc('index.html')
    .pipe(rimraf());
});

gulp.task('clean:js', function() {
  return gsrc('build/build.js')
    .pipe(rimraf());
});

gulp.task('clean:css', function() {
  return gsrc('build/build.css')
    .pipe(rimraf());
});

gulp.task('clean:images', function() {
  return gsrc('images')
    .pipe(rimraf());
});

gulp.task('connect', ['build'], function() {
  connect.server({
    root: distpath(),
    livereload: true
  });
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.jade', ['html']);
  gulp.watch('src/styles/**/*.styl', ['css']);
  gulp.watch('src/images/**/*', ['images']);
  gulp.watch([
    'src/scripts/**/*.js',
    'bespoke-theme-*/dist/*.js' // Allow themes to be developed in parallel
  ], ['js']);
});

gulp.task('deploy', ['build'], function(done) {
  var message = 'Updated live version';
  if (namespace) {
    message += ' for ' + namespace;
  }
  ghpages.publish(path.join(__dirname, 'dist'), {
    logger: gutil.log,
    message: message,
    add: true
  }, done);
});

gulp.task('build', ['js', 'html', 'css', 'images']);
gulp.task('serve', ['connect', 'watch']);
gulp.task('default', ['build']);
