/******************************************************************************
* File: StartServer.js
* Description: Java Script server file for CS 290 Database interactions HW
* Author(s): Casey Hines, with inspiration from CS 390 course material and 
* w3schools.com (https://www.w3schools.com/)
******************************************************************************/
var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'student',
    password        : 'default',
    database        : 'student'
});

const path = require('path');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 17034);
app.use(express.static(__dirname + '/views'));

app.get('/',function(req, res, next){
    var context = {};
    pool.query('SELECT * FROM workouts', function(err, rows, fields){
        if (err){
            next(err);
            return;
        }
        context.results = rows;
        res.render('home', context);
    });
});

app.post('/',function(req, res, next){
    var context = {};
    pool.query('SELECT * FROM workouts', function(err, rows, fields){
        if (err){
            next(err);
            return;
        }
        context.results = rows;
        res.render('home', context);
    });
});

app.get('/reset-table',function(req,res,next){
  var context = {};
  pool.query("DROP TABLE IF EXISTS workouts", function(err){
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    });
  });
});

app.get('/insert', function(req,res,next){
    var context = {};
    pool.query("INSERT INTO workouts (name, reps, weight, date, lbs) VALUES (?,?,?,?,?)",
        [req.query.name, req.query.reps, req.query.weight, req.query.date, req.query.lbs],
         function(err, result){
            if (err){
                next(err);
                return;
        }
        pool.query('SELECT * FROM workouts', function(err, rows, fields){
            if (err){
                next(err);
                return;
            }
            context.results = rows;
            res.render('home', context);
        });
    });
});

app.get('/delete', function(req,res,next){
    var context = {};
    pool.query("DELETE FROM workouts WHERE id=?", [req.query.id], function(err, result){
        if (err){
            next(err);
            return;
        }
        context.result = "Deleted " + result.changedRows + " rows.";
        res.render('home', context);
    });
});

app.get('/update', function(req, res, next){
    var context = {};
    pool.query("SELECT * FROM workouts WHERE id=?", [req.query.id], function(err, result){
        if(err){
            next(err);
            return;
        }
        if(result.length == 1){
            var vals = result[0];
            pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ",
                [req.query.name || vals.name, req.query.reps || vals.reps, req.query.weight || vals.weight, req.query.date || vals.date, req.query.lbs || vals.lbs, req.query.id],
                function(err, result){
                    if (err){
                        next(err);
                        return;
                    }
                res.render('home', context);
            });
        }
    });
});

app.use(function(req,res){
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});
  
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.send('500 - Server Error');
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
