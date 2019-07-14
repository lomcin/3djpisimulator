exports.start = function(agentType,port) {
  const http = require('http')
  const fs = require('fs');
  const ip = '0.0.0.0'
  const origin_path = __dirname
  //const CircularJSON = require('circular-json');

  const server = http.createServer((req, res) => {
    //var agentType = '';
    //agentType = req.rawHeaders.filter(function(a) {return a.toLowerCase().indexOf('mobile') > -1;}).length > 0 ? "mobile" : "default";
    console.log('ip: '+ req.ip)
    console.log('req: ' + req.url);
    console.log("agentType: " + agentType);
  if (req.url.length == 1) req.url = "/index.html";
    fs.readFile(origin_path + "/" + agentType + req.url, (err, data) => {
    if (err) {
    	console.log(err);
    	res.writeHead(404, { 'Content-Type': 'text/plain' });
    }
    //var str = '' +CircularJSON.stringify(req);
    res.end(data)
  });
    //res.end('<h1>Aqui fica o que vamos enviar para o navegador como resposta!</h1>')
  })

  server.listen(port, ip, () => {
    console.log(`Servidor rodando em http://${ip}:${port}`)
    console.log('Para derrubar o servidor: ctrl + c');
  })

};

const agentType = '';
const port = 8080;
const serverJS = require('./server.js');
serverJS.start(agentType,port);