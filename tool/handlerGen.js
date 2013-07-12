var protoList = [];

var whatFor = '';

process.argv.forEach(function(val, index, array) {
	if (index > 1) {
		protoList.push(val);
	}
});

var protoIdList = [];

for (var i = 0; i < protoList.length; ++i) {
	protoIdList.push(require('./' + protoList[i] + 'Id'));
}

var fs = require('fs');

var output = '';
var tail = '';

output += "var mysql = require('./handler_MySQL');" + '\n'
		+ "var mongodb = require('./handler_MongoDB');" + '\n'
		+ "var options = {MYSQL: 1, MONGODB: 2};" + '\n'
		+ "var flags = options['MYSQL'] /*+ options['MONGODB']*/;" + '\n'
		+ '\n'
		;

for (var i = 0; i < protoIdList.length; ++i) {
	for (var j = 0; j < protoIdList[i].list.length; ++j) {
		output += "function "+protoIdList[i].list[j]+"Handler(response, data) {"+'\n'
				+ '\t' + "if (flags & options['MYSQL']) mysql."+protoIdList[i].list[j]+"Handler(response, data);"+'\n'
				+ '\t' + "if (flags & options['MONGODB']) mongodb."+protoIdList[i].list[j]+"Handler(response, data);"+'\n'
				+ "}"+'\n'
				+ '\n'
				;

		tail += 'exports.' + protoIdList[i].list[j] + 'Handler = ' + protoIdList[i].list[j] + 'Handler;' + '\n'
				;
	}
}

output += tail;

fs.writeFile('handler.js', output, function (err) {
	if (err) throw err;

	console.log('handler.js file has been generated');
});



