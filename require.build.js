({
    name: "jquery-moving-service",
    baseUrl: "",
    paths: {
      "jquery-moving-service":  './dist/shared/jquery-moving-service',
      'requirejs':    './vendor/bower/requirejs/require',
      "moving-form": "./dist/shared/moving-form",
      jquery: './vendor/bower/jquery/jquery',
      'jquery-ui': './vendor/bower/jquery-ui/jquery-ui'
    },
    // Exclude files from the build that you expect to be included in the parent project, eg jquery
    exclude: ['jquery', 'jquery-ui'],
    out: "./dist/jquery-moving-service.js"
})
