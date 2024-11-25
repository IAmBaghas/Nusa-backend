const timeout = require('connect-timeout');

const timeoutMiddleware = timeout('30s');

module.exports = timeoutMiddleware;