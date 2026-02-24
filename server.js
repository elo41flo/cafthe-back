const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('BRAVO ELO : Le serveur Node tourne enfin ! (Test sans Express)');
});

// Port géré par Plesk
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Test de survie actif");
});