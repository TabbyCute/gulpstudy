//cnpm i -D gulp-cssmin //替换css空格的插件

//cnpm i -D gulp-autoprefixer //给样式添加前缀，为了兼容浏览器
/*
  把配置写在package.json 里面
  eg "browserslist":["last 5 versions"]

  Replace Autoprefixer browsers option to Browserslist config.
  Use browserslist key in package.json or .browserslistrc file.

  Using browsers option can cause errors. Browserslist config can
  be used for Babel, Autoprefixer, postcss-normalize and other tools.

  If you really need to use option, rename it to overrideBrowserslist.

  Learn more at:
  https://github.com/browserslist/browserslist#readme
  https://twitter.com/browserslist
 */

//cnpm i -D gulp-sass //打包sass   提示python啥的 那是版本没对

//cnpm i -D gulp-uglify //压缩打包js

//cnpm i -D gulp-babel //es6 转 es5  gulp-babel@8用的gulp4  gulp-babel@7用的gulp3  同时还依赖下面两个
//cnpm i -D @babel/core 
//cnpm i -D @babel/preset-env

//cnpm i -D gulp-htmlmin //压缩html   参数详情看文档https://github.com/kangax/html-minifier

//cnpm i -D del //清楚上次打包的文件 <!--不是流，直接执行这个函数-->

//cnpm i -D gulp-webserver //本地服务器 https://www.npmjs.com/package/gulp-webserver

//cnpm i -D gulp-imagemin //压缩图片  因为要保证无损，大多时候不压缩

//cnpm i -D gulp-file-include //组件打包，把一个html当成一个片段打到另一个组件里面

//有些东西不需要打包，比如 fonts ....

const gulp = require("gulp")
const cssmin = require("gulp-cssmin")
const autoprefixer = require("gulp-autoprefixer")
const sass = require("gulp-sass")(require("node-sass"))
const uglify = require("gulp-uglify")
const babel = require("gulp-babel")
const htmlMin = require("gulp-htmlmin")
const del = require("del")
const webserver = require("gulp-webserver")
const fileInclude = require("gulp-file-include")


//打包css
const cssompress = function(){
    // gulp.src("./src/**/*")
    return gulp
        .src("./src/css/*.css")
        .pipe(autoprefixer())
        .pipe(cssmin())
        .pipe(gulp.dest("./dist/css/"))
}

//打包scss
const sassHandler = function(){
    // gulp.src("./src/**/*")
    return gulp
        .src("./src/css/*.scss")
		.pipe(sass())
        .pipe(autoprefixer())
        .pipe(cssmin())
        .pipe(gulp.dest("./dist/css/"))
}

//打包js
const jsHandler = function(){
    return gulp
        .src("./src/js/*.js")
        .pipe(babel({
			presets:["@babel/env"]
		}))
		.pipe(uglify())
        .pipe(gulp.dest("./dist/js/"))
}

//打包html
const htmlHandler = function(){
    return gulp
        .src("./src/page/*.html")
		//打包组件
		.pipe(fileInclude({
			prefix:"@#@",//定义的一个标识符
			basepath:"./src/components",//组件存放的目录
			
			/*
				使用 ：  @#@include("./header.html")
				
				给组件传值 @#@include("./header.html",{data:"1",name:"header"})
				
				组件 <div>@#@data</div> <div>@#@header</div>
			*/
			
		}))
		.pipe(htmlMin({
			collapseWhitespace:true,//移除空格
			removeEmptyAttributes:true,//移除空属性(自定义属性不行，原生的)
			collapseBooleanAttributes:true,//合并bool为true的属性 ，比如checked="checked" => checked 
			removeAttributeQuotes:true,//比如  class="a" -> class=a   class="a b"则不行
			minifyCSS:true,//压缩style标签的代码(基本压缩，所以最好外联)
			minifyJS:true,//压缩js标签的代码(基本压缩，所以最好外联)
			removeScriptTypeAttributes:true,//type="text/javascript"从script标签中删除。其他type属性值保持不变
			removeStyleLinkTypeAttributes:true,//type="text/css"从style和link标签中删除。其他type属性值保持不变
			//其他看文档
		}))
        .pipe(gulp.dest("./dist/page/"))
}

//导出图片
const imgHandler = function(){
    return gulp
        .src("./src/assets/*")
        .pipe(gulp.dest("./dist/assets/"))
}

//打包一个第三方任务
const libHandler = function(){
    return gulp
        .src("./src/lib/**/*")
        .pipe(gulp.dest("./dist/lib/"))
}

//删除方任务
const delHandler = function(){
	//传如数组(你要删除的目录)
    return del(["./dist/"])
}

//删除方任务
const webserverHandler = function(){
	//传如数组(你要删除的目录)
    return gulp
		.src("./dist")
		.pipe(webserver({
			host:"localhost",
			/*
				如果你这里是自定义,假如 www.tabby.com
				找到 C:\Windows\System32\drivers\etc\hosts
				末尾加上 127.0.0.1       www.tabby.com
			*/
			port:"9527",
			livereload:true,//默认你修改dist下面的文件才会刷新,但是要修改dist那么只能重新打包
			open:true,//自动打开浏览器
			fallback: './page/index.html',//默认打开的路径(根目录是上面的dist
			proxies:[
				/*
					每一个代理都是一个对象，不要写空对象
					http://localhost:9000/geta/cors 跨域错误的地址
					http://localhost:9000/  代理地址
					/proxytest/geta/cors  200
					
					
					http://localhost:9000/geta/cors 跨域错误的地址
					http://localhost:9000/geta/  代理地址
					/proxytest/cors  200
				*/
				{
					source: '/proxytest',//代理标识符号 
					target: 'http://localhost:9000/geta/',//代理地址
					// options: {
					// 	headers: {
					// 		'ABC_HEADER': 'abc',
					// 	},
					// },
				}
			]
		}))
}

//监控任务
const watchHandler = function(){
	gulp.watch("./src/css/*",sassHandler)
}


module.exports.cssompress=cssompress

module.exports.sassHandler=sassHandler

module.exports.jsHandler=jsHandler

module.exports.htmlHandler=htmlHandler

module.exports.imgHandler=imgHandler

module.exports.delHandler=delHandler

module.exports.webserverHandler=webserverHandler


/*
	配置一个默认任务，把上面的一起执行了
	1.  gulp.task("defalut",()=>{})
	2.  module.exports.default=()=>{}
	
	3.  如下   当然你也可以叫abc那么执行 gulp abc,如果是default,那么可以只执行gulp就OJ
*/
// module.exports.default=gulp.parallel(cssompress,sassHandler,jsHandler,htmlHandler,imgHandler)


/*
	删除任务
	比如你这次css文件夹里只有一个b.css文件删除了上次的a.css，
	那么你下次打包dist/css文件路径下a.css还是存在
	
*/
// module.exports.default=gulp.series(
// 	delHandler,
// 	gulp.parallel(cssompress,sassHandler,jsHandler,htmlHandler,imgHandler)
// )

/*
	用gulp启动一个服务
	src：
		html引用的是一个stylusScss.css文件 因为不存在所以会报错
	dist：
		html引用的是一个stylusScss.css文件 因为stylusScss.scss被转成了css文件所以没问题
*/
// module.exports.default=gulp.series(
// 	delHandler,
// 	gulp.parallel(cssompress,sassHandler,jsHandler,htmlHandler,imgHandler),
// 	webserverHandler,
// )


/*
	监控任务
*/
module.exports.default=gulp.series(
	delHandler,
	gulp.parallel(cssompress,sassHandler,jsHandler,htmlHandler,imgHandler),
	webserverHandler,
	watchHandler
)