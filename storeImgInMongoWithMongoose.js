/**
 * Module dependencies
 */

var express = require('express');
var fs = require('fs');
var path = require('path');
var http = require('http');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// img path
var imgPath = path.join(__dirname, 'download.jpg');

// connect to mongo
mongoose.connect('localhost', 'testing_storeImg');

// example schema
var schema = new Schema({
    img: { data: Buffer, contentType: String }
});

// our model
var A = mongoose.model('A', schema);

mongoose.connection.on('open', function () {
  console.error('mongo is open');

  // empty the collection
  A.remove(function (err) {
    if (err) throw err;

    console.error('removed old docs');

    // store an img in binary in mongo
    var a = new A;
    a.img.data = fs.readFileSync(imgPath);
    a.img.contentType = 'image/jpg';
    a.save(function (err, a) {
      if (err) throw err;

      console.error('saved img to mongo');

      // start a demo server
      var app = express();
      // var server = express.createServer();
      app.get('/', function (req, res, next) {
        A.findById(a, function (err, doc) {
          if (err) return next(err);
          res.contentType(doc.img.contentType);
                // res.setHeader('Content-Type','image/jpeg'); // set this to whatever you need or use some sort of mime type detection

// var image = new Buffer(doc.img.data).toString('base64');
res.send(doc.img.data);

// res.send('<img src="" id="img1">' +
// '<script>document.getElementById("img1").src = "data:image/jpeg;base64,' +
// 'string base64'  +
// '"</script>'
// );

        });
      });

      // server.on('close', function () {
      //   console.error('dropping db');
      //   mongoose.connection.db.dropDatabase(function () {
      //     console.error('closing db connection');
      //     mongoose.connection.close();
      //   });
      // });

      // server.listen(3333, function (err) {
      http.createServer(app).listen(3333, function (err) {
        // var address = server.address();
        // console.error('server listening on http://%s:%d', address.address, address.port);
        console.error('press CTRL+C to exit');
      });

      process.on('SIGINT', function () {
        // server.close();
        http.close();
      });
    });
  });

});
