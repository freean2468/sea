mysql = require('mysql');

var db = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: 'xmongames',
	database: 'sea',
});

// var myParams = "'param1', 'param2', ... ";
// db.quer('CALL MyProcedure(' + myParams + ')', function ..... .. .. 

db.query('call test', function(err, results, fileds) {
	if (err || results[0].res === 0) {
		throw console.log(err);
	} else {
		console.log(results);
	}
});
