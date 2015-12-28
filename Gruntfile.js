'use strict';

module.exports = function(grunt) {

	var pkg, bower, taskName, name;

	pkg = grunt.file.readJSON('package.json');
	bower = grunt.file.readJSON('bower.json');
	name = pkg.name.toLowerCase();

	grunt.initConfig({
		pkg: pkg,
		bowerJSON: bower,
		banner:	'/*!\n' +
						' * <%= pkg.name %> v<%= pkg.version %>\n' +
						' * Website <%= pkg.website %>\n' +
						' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
						' * The <%= pkg.license %> License\n' +
						' * Based on Bootstrap v<%= bowerJSON.devDependencies.bootstrap %> (http://getbootstrap.com)\n' +
						' */',
		// bannerの調整
		replace: {
			// バナーの追加
			banner: {
				src: ['dist/css/bootstrap**.css'],
				dest: 'dist/css/',
				replacements: [
					{
						from: '@charset "UTF-8";',
						to: '@charset "UTF-8";\n<%= banner %>'
					}
				]
			}
		},
		// cssmin
		cssmin: {
			minify: {
				expand: true,
				cwd: 'dist/css/',
				src: ['bootstrap.css'],
				dest: 'dist/css/',
				ext: '.min.css',
				options: {
					advanced: false,
					keepSpecialComments: '*',
					compatibility: 'ie8',
				}
			}
		},
		// SCSSのコンパイル
		sass: {
			options: {
				sourcemap: 'none',
				unixNewlines: true,
				style: 'expanded',
				bundleExec: true,
				loadPath: ['bower_components/']
			},
			bootstrap: {
				files: [{
					expand: true,
					cwd: 'scss',
					src: ['**/*.scss'],
					dest: 'dist/css/',
					ext: '.css'
				}]
			},
			assets: {
				options: {
					loadPath: ['scss/', 'bower_components/']
				},
				files: [{
					expand: true,
					cwd: 'src/scss',
					src: ['**/*.scss'],
					dest: 'dist/assets/css/',
					ext: '.css'
				}]
			}
		},
		csscomb: {
			options: {
				config: 'bower_components/bootstrap/less/.csscomb.json'
			},
			bootstrap: {
				files: {
					'dist/css/bootstrap.css': ['dist/css/bootstrap.css']
				}
			},
			assets: {
				expand: true,
				cwd: 'dist/assets/css/',
				src: ['**/*.css'],
				dest: 'dist/assets/css',
				ext: '.css'
			}
		},
		autoprefixer: {
			bootstrap: {
				files: {
					'dist/css/bootstrap.css': ['dist/css/bootstrap.css']
				}
			},
			assets: {
				expand: true,
				cwd: 'dist/assets/css/',
				src: ['**/*.css'],
				dest: 'dist/assets/css',
				ext: '.css'
			}
		},
		// SCSSのLinter
		scsslint: {
			options: {
				bundleExec: true,
				config: '.scss-lint.yml',
				reporterOutput: null,
				colorizeOutput: true
			},
			bootstrap: ['scss/**/*.scss'],
			assets: ['src/scss/**/*.scss']
		},
		// clean
		clean: {
			build: {
				src: ['bower_components/**/*', 'dist/css/**/*', 'dist/js/**/*', 'dist/fonts/**/*']
			}
		},
		// bowerのインストール
		bower: {
			install: {
				options: {
					targetDir: 'dist/',
					layout: function(type, component, source) {
						return type;
					}
				}
			}
		},
		// ファイル更新監視
		watch: {
			// 自動コンパイル
			bootstrap: {
				files: ['scss/**/*.scss', 'src/scss/**/*.scss'],
				tasks: ['scsslint', 'css']
			}
		},
		// テストサーバ
		connect: {
			server: {
				options: {
					port: 8000,
					hostname: '*',
					base: 'dist'
				}
			}
		},
		compress: {
			main: {
				options: {
					archive: 'data/bootstrap-'+ name +'-'+ pkg.version +'-dist.zip'
				},
				files: [
					{
						//CSS
						expand: true,
						cwd: "dist/css/",
						src: ["bootstrap**.css"],
						dest: name +"/css"
					},
					{
						// Font
						expand: true,
						cwd: "dist/fonts/",
						src: ["**/*"],
						dest: name +"/fonts"
					},
					{
						// JavaScript
						expand: true,
						cwd: "dist/js/",
						src: ["bootstrap.**js"],
						dest: name +"/js"
					},
					{
						// Sample html
						expand: true,
						cwd: "dist/",
						src: ["bootstrap.html"],
						dest: name
					},
					{
						// README
						src: ["README.md"],
						dest: name
					}
				]
			}
		}
	});

	// GruntFile.jsに記載されているパッケージを自動読み込み
	for(taskName in pkg.devDependencies) {
		if(taskName.substring(0, 6) == 'grunt-') {
			grunt.loadNpmTasks(taskName);
		}
	}

	// 本家Bootstrapのautoprefixerの設定を読み込む
	grunt.task.registerTask('setAutoPrefixerConfig', 'Get autoprefixer config from bootstrap', function() {
		grunt.config.merge({
			autoprefixer: {
				options: {
					browsers: [
						//
						// Official browser support policy:
						// http://v4-alpha.getbootstrap.com/getting-started/browsers-devices/#supported-browsers
						//
						'Chrome >= 35', // Exact version number here is kinda arbitrary
						// Rather than using Autoprefixer's native "Firefox ESR" version specifier string,
						// we deliberately hardcode the number. This is to avoid unwittingly severely breaking the previous ESR in the event that:
						// (a) we happen to ship a new Bootstrap release soon after the release of a new ESR,
						//     such that folks haven't yet had a reasonable amount of time to upgrade; and
						// (b) the new ESR has unprefixed CSS properties/values whose absence would severely break webpages
						//     (e.g. `box-sizing`, as opposed to `background: linear-gradient(...)`).
						//     Since they've been unprefixed, Autoprefixer will stop prefixing them,
						//     thus causing them to not work in the previous ESR (where the prefixes were required).
						'Firefox >= 31', // Current Firefox Extended Support Release (ESR)
						// Note: Edge versions in Autoprefixer & Can I Use refer to the EdgeHTML rendering engine version,
						// NOT the Edge app version shown in Edge's "About" screen.
						// For example, at the time of writing, Edge 20 on an up-to-date system uses EdgeHTML 12.
						// See also https://github.com/Fyrd/caniuse/issues/1928
						'Edge >= 12',
						'Explorer >= 9',
						// Out of leniency, we prefix these 1 version further back than the official policy.
						'iOS >= 8',
						'Safari >= 8',
						// The following remain NOT officially supported, but we're lenient and include their prefixes to avoid severely breaking in them.
						'Android 2.3',
						'Android >= 4',
						'Opera >= 12'
					]
				}
			}
		});
	});

	// テスト
	grunt.registerTask('test', ['scsslint']);

	// CSSビルド
	grunt.registerTask('css', ['sass', 'autoprefixer']);

	// 最適化
	grunt.registerTask('optimize', ['csscomb', 'cssmin:minify']);

	// 開発用
	grunt.registerTask('server', ['bower:install', 'setAutoPrefixerConfig', 'test', 'css', 'connect', 'watch']);

	// ビルドタスク
	grunt.registerTask('build', ['clean:build', 'bower:install', 'setAutoPrefixerConfig', 'test', 'css', 'optimize', 'replace:banner']);

	// 配布用パッケージ作成
	grunt.registerTask('package', ['build', 'compress:main']);

	grunt.registerTask('eatwarnings', function() {
		grunt.warn = grunt.fail.warn = function(warning) {
			grunt.log.error(warning);
		};
	});

};
