import { src, dest, parallel, series, watch } from 'gulp'
import plumber from 'gulp-plumber'
import pug from 'gulp-pug'
import browserSync from 'browser-sync'
import sass from 'gulp-sass'
import postcss from 'gulp-postcss'
import cssnano from 'cssnano'
// import watch from 'gulp-watch'
import browserify from 'browserify'
import babelify from 'babelify'
import source from 'vinyl-source-stream'
import sourcemaps from 'gulp-sourcemaps'
import buffer from 'vinyl-buffer'
import minify from 'gulp-minify'
import imagemin from 'gulp-imagemin'
import sitemap from 'gulp-sitemap'
import cachebust from 'gulp-cache-bust'

const server = browserSync.create()

const postcssPlugins = [
    cssnano({
        core: true,
        zindex: false,
        autoprefixer: {
            add: true,
            browsers: '> 1%, last 2 versions, Firefox ESR, Opera 12.1'
        }
    })
]

const sitemapTask = () => {
    return src('./public/**/*.html', { read: false })
        .pipe(sitemap({
            siteUrl: "https://www.upayatech.com"
        }))
        .pipe(dest("./public"))

}

const pugTask = () => {
    return src('./src/pug/**.pug')
        .pipe(plumber())
        .pipe(pug({
            basedir: './src/pug'
        }))
        .pipe(dest('./public'))
}

const sassTask = () => {
    return src('./src/sass/style.scss')
        .pipe(sass()).on('error', (e) => { console.log('error en la compilacion SASS', e) })
        .pipe(plumber())
        .pipe(postcss(postcssPlugins)).on('error', (e) => { console.log('error en la compilacion POST CSS'), e })
        .pipe(dest('./public/css'))
        // .pipe(server.stream({ match: '**/*.css' }))
}

const imgTask = () => {
    return src('./src/assets/imgs/**')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo()
        ]))
        .pipe(dest('./public/assets/img'))
        
}

const initServer = () => {
    server.init({
        server: {
          baseDir: './public'
        }
      })
}

const fontTask= () =>{
return src("src/assets/fonts/**")
    .pipe(dest("public/assets/fonts"))
}

exports.fonts = fontTask;
exports.pug = pugTask;
exports.imgs = imgTask;
exports.sass = sassTask;
exports.build = series(pugTask, imgTask, sassTask, fontTask), initServer;
exports.default = series(pugTask, sassTask, initServer);

const watcher = watch(["./src"])

watcher.on('all', (path, stats)=>{
    console.log(`File ${path} was changed`);  
    console.log(`File ${stats} estado`);  
    pugTask()
    sassTask()
    server.reload()
})

// watcher.close()

//TODO HUMAN, robots, cache 