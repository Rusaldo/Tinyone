var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var browserSync = require('browser-sync');
var uglify = require('gulp-uglifyjs');
var concat = require('gulp-concat');
var del = require("del");
var imagemin = require("gulp-imagemin");
var cache = require("gulp-cache");

// Прихорашиваем CSS
gulp.task("style", function() {
  gulp.src("app/sass/main.scss")
    .pipe(plumber())
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(postcss([
      autoprefixer({cascade: true})
    ]))
    .pipe(gulp.dest("app/css"))
    .pipe(minify())
    .pipe(rename("main.min.css"))
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.reload({stream: true}))
});

// Запускаем локальный сервер
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false
  });
});

// Минифицируем js файлы библиотек
gulp.task('scripts', function() {
  return gulp.src([
    'app/js/index.js'
  ])
  .pipe(uglify())
  .pipe(gulp.dest('app/js'));
});

// Оптимизируем изображения
gulp.task("images", function() {
  return gulp.src("app/img/**/*.{png,jpg,svg}")
    .pipe(cache(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ])))
    .pipe(gulp.dest('build/img'));
});

// Следим за изменениями файлов
gulp.task('watch', ['browser-sync', 'style', 'scripts'], function() {
  gulp.watch('app/sass/**/*.scss', ['style']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});

// Очищаем папку сборки перед сборкой
gulp.task('clean', function() {
  return del('build');
});

// Собираем файлы в папку build
gulp.task('build', ['clean', 'images', 'style', 'scripts'], function() {
  var buildCSS = gulp.src([
    'app/css/main.css',
    'app/css/main.min.css'
  ])
  .pipe(gulp.dest('build/css'))

  var buildFonts = gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('build/fonts'))

  var buildJS = gulp.src('app/js/**/*')
  .pipe(gulp.dest('build/js'))

  var buildHTML = gulp.src('app/*.html')
  .pipe(gulp.dest('build'));
});

// Чистим cache
gulp.task('clear', function() {
  return cache.clearAll();
});

// Дефолтный таск вызывает таск watch
gulp.task('default', ['watch']);
