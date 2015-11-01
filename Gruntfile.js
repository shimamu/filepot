module.exports = function(grunt) {
	//Gruntの設定
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: 
					"/*\n" + 
					" *   filepot\n" +
					" *   https://github.com/shimamu/filepot/\n" +
					" *   (c) 2015 Ryo Shimamura\n" +
					" *       filepot may be freely distributed under the MIT license.\n" +
					" */",
					sourceMap: true,
			},
			filepot: {
				files: {'src/js/filepot.min.js': ['src/js/filepot.js']}
			},
			ecl: {
				files: {'src/js/ecl.min.js': ['src/js/ecl.js']}
			},
			namespace: {
				files: {'src/js/namespace.min.js': ['src/js/namespace.js']}
			},
			zip: {
				files: {'src/js/zip.min.js': ['src/js/zip.js']}
			},
		},
		cssmin: {
			style: {
				files: {'src/css/style.min.css': ['src/css/style.css']}
			}
		},
		/*
		inline: {
			dist: {
				src: ['src/filepot.html'],
				dest: 'dist/filepot.html'
			}
		}
		*/

		inline: {
			dev: {
				options:{
					cssmin: true,
					uglify: true
				},
				src: ['src/filepot.html'],
				dest: 'dist/filepot.html'
			},
			/*
			compressed: {
				options:{
					uglify: true
				},
				src: ['src/html/test.html'],
				dest: 'dist/min/'
			}
			*/
		}

	});

	/*
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	*/
	grunt.loadNpmTasks('grunt-inline');

	//defaultタスクの定義
	//grunt.registerTask('default', ['uglify', 'cssmin']);
	
	//grunt.registerTask('inline', ['inline']);
	grunt.registerTask('default', ['inline']);
	/*
	Log some stuff.', function() {
		//ログメッセージの出力
		grunt.log.write('Logging some stuff...').ok();
	});
	*/
};
