const path = require('path');
var fs= require('fs');

module.exports = (config, context) => {
  const { rootDir, userConfig } = context;
  const { outputDir } = userConfig;

  // history fall back
  const htmlPath = path.resolve(rootDir, outputDir, 'web/index.html');

  config.devServer.set('before', (app, devServer) => {
    const compiler = devServer.compiler.compilers[0];
    const memFs = compiler.outputFileSystem;

    // not match .js .html files
    app.get(/^\/?((?!\.(js|html|css|json)).)*$/, function(req, res) {
      if (memFs.existsSync(htmlPath)) {
        const outPut = memFs.readFileSync(htmlPath).toString();
        res.send(outPut);
      } else {
        compiler.hooks.done.tap('sendHtml', () => {
          fs.exists(htmlPath, function(exists) {
            if (exists) {
              const outPut = memFs.readFileSync(htmlPath).toString();
              res.send(outPut);
            }
          });
        });
      }
    });
  });
};
