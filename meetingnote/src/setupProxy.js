const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(["/registration","/check_login"], createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
  }));
  app.use(["/meeting","/socket.io"],createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    ws: true,
  }));
};