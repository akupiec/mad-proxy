const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mockData = require('./middlewares/mockData');
const validateCache = require('./middlewares/validateCache');
const bodyDataInterceptor = require('./middlewares/bodyDataInterceptor');
const reverseProxy = require('./middlewares/reverseProxy');
const mockGetter = require('./middlewares/mockGeter');
const mockSaver = require('./middlewares/mockSaver');
const logger = require('./logger');

module.exports = function (proxyServer, config) {
    const LOGGER = logger(config);

    const app = express();
    app.use(cookieParser());
    app.use(bodyParser.raw({type: '*/*'}));

    if (config.server.staticSource) {
        app.use(config.server.staticSource, express.static(config.server.staticPath));
    }

    config.proxies.map(proxy => {
        LOGGER.info(`Binding proxy on: ${proxy.contextPath}`);

        app.use(proxy.contextPath, mockData(config));
        app.use(proxy.contextPath, validateCache(config));
        app.use(proxy.contextPath, bodyDataInterceptor(config));
        app.use(proxy.contextPath, mockSaver(config));
        app.use(proxy.contextPath, mockGetter(config));
        app.all(proxy.contextPath + '/*', reverseProxy(config, proxyServer));
    });

    if (config.server.fallback) {
        LOGGER.info(`Binding fallback: ${config.server.staticPath}${config.server.fallback}`);
        app.all('/*', function (req, res) {
            res.sendFile(config.server.fallback, {root: config.server.staticPath});
        });
    }

    return app.listen(config.server.port, function () {
        LOGGER.info(`LOCAL PROXY SERVER: listening on http://localhost:${config.server.port} and proxing: ${config.proxy.target} \n\n`);
    });
};
