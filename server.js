var application_root =  __dirname;
var express = require('express');
var http = require('http');
var app = express();
app.configure = function(){

    //app.use( express.static( path.join( application_root, 'site') ) );
    app.use(express.static(application_root));

};
//http.createServer(app).listen(1234, "127.0.0.1");
app.listen(1234,function() {
    console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
});
console.log('Server running at http://127.0.0.1:1234/');