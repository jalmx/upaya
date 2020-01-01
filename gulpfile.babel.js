import { src, dest, parallel, series, watch } from 'gulp'
import plumber from 'gulp-plumber'
import pug from 'gulp-pug'
import browserSync from 'browser-sync'
import sass from 'gulp-sass'
import postcss from 'gulp-postcss'
import cssnano from 'cssnano'
import browserify from 'browserify'
import babelify from 'babelify'
import source from 'vinyl-source-stream'
import sourcemaps from 'gulp-sourcemaps'
import buffer from 'vinyl-buffer'
import minify from 'gulp-minify'
import imagemin from 'gulp-imagemin'
import sitemap from 'gulp-sitemap'
import cachebust from 'gulp-cache-bust'
import htmlmin from 'gulp-htmlmin';
import humans from 'gulp-humans';
import robots from 'gulp-robots';

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
            siteUrl: "https://www.upayatech.work"
        }))
        .pipe(dest("./public"))

}

const pugTask = () => {
    return src('./src/pug/**.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: false,
            basedir: './src/pug'
        }))
        .pipe(dest('./public'))
}

const sassTask = () => {
    return src('./src/sass/style.scss')
        .pipe(sass()).on('error', (e) => { console.log('error en la compilacion SASS', e) })
        .pipe(postcss(postcssPlugins)).on('error', (e) => { console.log('error en la compilacion POST CSS'), e })
        .pipe(dest('./public/css'))
        .pipe(server.stream())
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
    console.log('inicia el servidor');

}

const fontTask = () => {
    return src("src/assets/fonts/**")
        .pipe(dest("public/assets/fonts"))
}

const humanTask = () => {
    return src('public/index.html')
        .pipe(humans({
            team: [{
                "Original developer": "Alejandro Leyva",
                Twitter: "@jalm_x",
                Github: "@jalmx"
            },
            {
                Maintainer: "Xizuth Inc",
                Github: "@xizuth_tech"
            }],
            thanks: [
                'Node (@nodejs on Twitter)',
                'Gulp (@gulpjs on Twitter)'
            ],
            site: [
                'Standards: HTML5, CSS, ES6',
                'Components: Pug, SASS, Google Fonts, Material Design Icons',
                'Software: Visual Studio Code'
            ],
            note: 'Built with love by Alejandro Leyva.'
        }))
        .pipe(dest('public/'));
}

const robotTask = () => {
    return src('./public/index.html')
        .pipe(robots({
            useragent: '*',
            allow: ['/'],
            disallow: ['cgi-bin/']
        }))
        .pipe(dest('public/'));
}

const faviconTask = () => {
    return src('src/assets/favicon/**')
        .pipe(dest('public/assets/favicon'))
}
const cacheTask = () => {
    return src('./public/**/**.html')
        .pipe(cachebust({
            type: 'timestamp'
        }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest('./public'))
}

exports.fonts = fontTask;
exports.favicon = faviconTask;
exports.humans = humanTask;
exports.robot = robotTask;
exports.cache = cacheTask;
exports.pug = pugTask;
exports.sitemap = sitemapTask;
exports.imgs = imgTask;
exports.sass = sassTask;
exports.build = series(pugTask, imgTask, sassTask, fontTask, humanTask, robotTask, sitemapTask, faviconTask, cacheTask, initServer);
exports.default = series(pugTask, sassTask, initServer);

const watcher = watch(["./src"])

watcher.on('all', (path, stats) => {

    if (stats.indexOf('sass') > 0) {
        sassTask()
        console.log('actualiza css');
    } else if (stats.indexOf('pug') > 0) {
        pugTask()
        console.log('actualiza html');
        server.reload()
    }
})