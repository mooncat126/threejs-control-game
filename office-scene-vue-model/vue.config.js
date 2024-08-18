const { defineConfig } = require("@vue/cli-service");
const path = require("path");

module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: 'dist/custom-dir', // 更改输出目录
  publicPath: '/', // 设置 publicPath
  chainWebpack: (config) => {
    const types = ["vue-modules", "vue", "normal-modules", "normal"];
    types.forEach((type) =>
      addStyleResource(config.module.rule("scss").oneOf(type))
    );
    config.plugin('html').tap(args => {
      args[0].title = 'Your New Title'; // 修改页面标题
      return args;
    });

    config.resolve.alias
      .set('@components', path.resolve(__dirname, 'src/components'))
      .set('@assets', path.resolve(__dirname, 'src/assets'));

    config.performance
      .hints(false)
      .maxEntrypointSize(512000)
      .maxAssetSize(512000);
  },
});

function addStyleResource(rule) {
  rule
    .use("style-resource")
    .loader("style-resources-loader")
    .options({
      patterns: [
        path.resolve(__dirname, "./src/styles/tools/_sassMagic.scss"),
        path.resolve(__dirname, "./src/styles/tools/_variables.scss")
      ],
    });
}
