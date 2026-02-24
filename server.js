const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Vérification réussie : Le moteur Node tourne.');
});
server.listen(process.env.PORT || 3000);