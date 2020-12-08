let gulp    = require('gulp')
let plumber = require('gulp-plumber')
let babel   = require('gulp-babel')
let bro     = require('gulp-bro')

gulp.task('js', function() {
  gulp.src('src/app.js')
    .pipe(plumber())
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(bro())
    .pipe(gulp.dest('./'))
})

gulp.task('watch', () => {
  gulp.watch('src/**/*.*', {cwd: './'}, ['js'])
})

gulp.task('default', ['watch', 'js'])