var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    nodemon = require('gulp-nodemon'),
    git = require('gulp-git'),
    shell = require('shelljs'),
    changed = require('gulp-changed'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    imageResize = require('gulp-image-resize'),
    imagemin = require('gulp-imagemin'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    confirm = require('gulp-confirm'),
    watch = require('gulp-watch'),
    batch = require('gulp-batch'),
    merge = require('merge-stream');

gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({
    script: 'app.js',
    watch: ['app.js','routes/**/*.js']
  })
    .on('start', function onStart() {
      if (!called) { cb(); }
      called = true;
    })
    .on('restart', function onRestart() {
      //small reload delay
      setTimeout(function reload() {
        browserSync.reload({
          stream: false
        });
      }, 500);
    });
});



gulp.task('browser-sync', ['nodemon'], function () {
  browserSync({
    proxy: 'http://localhost:3000',
    files: ['./public/**/*.*','./templates/**/*.*','!public/**/*.scss'],
    port: 4000,
    browser: ['google-chrome'],
    startPath: '/meme-generator/'
  });
});



gulp.task('dependencies', function () {

  var css = gulp.src('./build/vendor/**/*.js')
    .pipe(concat('dependency-bundle.js')) // Bundle JS
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'));

  var js = gulp.src('./build/vendor/**/*.css')
    .pipe(concat('dependency-bundle.css')) // Bundle CSS
    .pipe(minifyCss({ keepSpecialComments : 0, processImport: false })) // Don't keep CSS comments or process import statements like google fonts
    .pipe(gulp.dest('./public/css'));

  return merge(css, js);
});

gulp.task('js', function () {
  // Copy data assets
  var data = gulp.src('./build/js/**/*.json')
    .pipe(gulp.dest('./public/js'));
  // Copy bundled scripts
  var bundled = gulp.src('./build/js/**/+*.js')
    .pipe(concat('scripts-bundle.js'))
    .pipe(gulp.dest('./public/js'));
  // Copy non-bundled scripts
  var copied = gulp.src(['./build/js/**/*.js','!./build/js/**/+*.js'])
    .pipe(gulp.dest('./public/js'));

  return merge(data, bundled, copied);
});

gulp.task('scss', function () {
  // Compile bundled SCSS
  var bundled = gulp.src('./build/sass/**/+*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename({extname: ".scss.css"}))
    .pipe(gulp.dest('./build/css/common'));
  // Compile non-bundled SCSS
  var copied = gulp.src(['./build/sass/**/*.scss','!./build/sass/**/+*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(rename({extname: ".scss.css"}))
    .pipe(gulp.dest('./build/css'));

  return merge(bundled, copied);
});

gulp.task('css', ['scss'] ,function () {
  // Copy bundled CSS
  var bundled = gulp.src('./build/css/**/+*.css')
    .pipe(concat('styles-bundle.css'))
    .pipe(gulp.dest('./public/css'));
  // Copy non-bundled CSS
  var copied = gulp.src(['./build/css/**/*.css','!./build/css/**/+*.css'])
    .pipe(gulp.dest('./public/css'));

  return merge(bundled, copied);
});

gulp.task('img',function () {
  function resize(size){
    return gulp.src(['./build/images/**/*.{png,jpg,JPG}','!./build/images/**/_*.{png,jpg,JPG}'])
      .pipe(changed('./public/images')) // Only process changed images for speed.
      // .pipe(imageResize({ width : size, upscale : false, imageMagick : true }))
      // .pipe(imagemin({
      //       progressive: true,
      //       svgoPlugins: [{removeViewBox: false}],
      //   }))
      // .pipe(rename(function (path)  {
      //                                 path.basename += ("-" + size.toString());
      //                                 path.extname = path.extname.toLowerCase();
      //                                 return path;
      //                               }))
      .pipe(gulp.dest('./public/images'));
  }

  // Copies over SVGs or other image files
  var other = gulp.src(['./build/images/**/*','!./build/images/**/*.{png,jpg,JPG}'])
    .pipe(changed('./public/images'))
    .pipe(gulp.dest('./public/images'));
  // Copy explicitly non-altered imgs
  var copied = gulp.src('./build/images/**/_*.{png,jpg,JPG}')
    .pipe(changed('./public/images'))
    .pipe(gulp.dest('./public/images'));

  // Create and copy resized imgs
  // var s1 = resize(3000);
  // var s2 = resize(2400);
  // var s3 = resize(1800);
  var s4 = resize(1200);
  // var s5 = resize(600);

  return merge(other, copied, s4);
});

// Video/audio files, CSV data, and miscellany
gulp.task('assets', function(){
  return gulp.src('./assets/**/*')
          .pipe(gulp.dest('./public/assets'));
});

// Watch for new images added and run img task
gulp.task('watch', function () {
    watch('./build/images/**/*', batch(function (events, done) {
        gulp.start('img', done);
    }));
});



gulp.task('default', ['assets','scss','css','js','dependencies','watch','browser-sync'], function () {
  gulp.watch('build/sass/**/*.scss', ['scss','css']);
  gulp.watch('build/js/**/*.js*', ['js']);
  gulp.watch('build/css/**/*.css', ['css']);
  gulp.watch('build/vendor/**/*.{css,js}', ['dependencies']);
  gulp.watch('build/assets/**/*', ['assets']);
});


////////////////////////////
/// Deploy Tasks

gulp.task('commit-deploy', function(){
    return gulp.src('./*')
      .pipe(confirm({
              question: 'You\'re about to deploy to the server. Be sure you\'ve committed your changes. Are you sure you\'re ready?',
              input: '_key:y'
            }));
});

gulp.task('commit-serve', function(){
    return gulp.src('./*')
      .pipe(confirm({
              question: 'You\'re about to serve your site. Be sure you\'ve already deployed your code. Are you sure you\'re ready?',
              input: '_key:y'
            }));
});

gulp.task('commit-pull', function(){
    return gulp.src('./*')
      .pipe(confirm({
              question: 'You\'re about to pull your site from the server. Are you sure?',
              input: '_key:y'
            }));
});

gulp.task('deploy-prod', ['commit-deploy'] ,function(){
  console.log("*************************************");
  console.log("RUNNING PRODUCTION SERVER DEPLOYMENT");
  console.log("*************************************");
  shell.exec('./deploy/send_prod.sh');
});

gulp.task('deploy-test', ['commit-deploy'] ,function(){
  console.log("*************************************");
  console.log("Running test server deployment");
  console.log("*************************************");
  shell.exec('./deploy/send_test.sh');
});

gulp.task('serve-prod', ['commit-serve'] ,function(){
  console.log("*************************************");
  console.log("SERVING APP ON PRODUCTION SERVER")
  console.log("*************************************");
  shell.exec('./deploy/serve_prod.sh');
});

gulp.task('serve-test', ['commit-serve'] ,function(){
  console.log("*************************************");
  console.log("Serving app on test server")
  console.log("*************************************");
  shell.exec('./deploy/serve_test.sh');
});

gulp.task('pull-prod', ['commit-pull'], function(){
  console.log("*************************************");
  console.log("PULLING APP FROM PRODUCTION SERVER")
  console.log("*************************************");
  shell.exec('./deploy/pull_prod.sh');
});

gulp.task('pull-test', ['commit-pull'], function(){
  console.log("*************************************");
  console.log("Pulling app from test server")
  console.log("*************************************");
  shell.exec('./deploy/pull_test.sh');
});
