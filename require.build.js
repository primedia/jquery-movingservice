({
    name: "jquery-moving-service",
    mainConfigFile: 'require.config.js',

    // Exclude files from the build that you expect to be included in the parent project, eg jquery
    exclude: ['jquery', 'pikaday', 'jquery-maskedinput'],

    out: "./dist/jquery-moving-service.js"
})
