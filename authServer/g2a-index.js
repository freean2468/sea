var g2a_server = require('./g2a-server'),
    g2a_route = require('./g2a-route');

var PORT = 8870;

var server = g2a_server.createServer(g2a_route);
server.listen(PORT);

console.log("g2a-tcp-server(" + process.pid + ") hast started at port " + PORT);
