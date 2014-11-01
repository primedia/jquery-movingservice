var grunt = require('grunt');

grunt.initConfig({
  bower: {
    target: {
      rjsConfig: 'dist/require.config.js'
    }
  }
});

grunt.loadNpmTasks('grunt-bower-requirejs');

grunt.registerTask('default', ['bower']);

