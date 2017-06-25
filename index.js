var express = require('express');
var app = express();
var pg = require('pg');

var {Pool} = require('pg') // that gets the Pool attribute from the full pg module

//Pool.defaults.ssl = true;


var gmaps = require('@google/maps').createClient({
  key: 'my key'
});

if (process.env.DATABASE_URL != '')
{
  var connectionString = process.env.DATABASE_URL;
} else {
var connectionString = 'postgres://postgres@localhost/gonning';
}

const pool = new Pool({connectionString});


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/user', function(request, response){
  const id = request.query.id;
  pool.query('SELECT * FROM "users" WHERE id = $1', [id], (err, res) => {
    if (err) {
      throw err
    } else {
      console.log(res);
      response.json(res.rows[0]);
    }
  })
  
});

app.get('/goals', function(request, response){
  const id = request.query.id;
  pool.query('SELECT * FROM "goals" WHERE id = $1', [id], (err, res) => {
    if (err) {
      throw err
    } else {
      console.log(res);
      response.json(res.rows[0]);
    }
  })
  
});

app.get('/map', function(request, response){
  var place = 'rexburg walmart';//'1600 Amphitheatre Parkway, Mountain View, CA';
  gmaps.geocode({
  address: place
}, function(err, response) {
  if (!err) {
    console.log("This works");
    console.log(response.json.results);
    //response.json.gmaps;
    res.writeHead(200, {"Content-Type": "application/json"});
    res.write('{ "name":"Jason Fitzgerald","class":"cs313" }');
    console.log("This works");
  }
});
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});