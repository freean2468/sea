var protocolList = require('./protocol').list;
var fs = require('fs');

var output = '';
var tail = '';

output += "var mysql = require('./requestHandler_MySQL');" + '\n'
		+ "var mongodb = require('./requestHandler_MongoDB');" + '\n'
		+ "var options = {MYSQL: 1, MONGODB: 2};" + '\n'
		+ "var flags = options['MYSQL'] + options['MONGODB'];" + '\n'
		+ '\n'
		+ "// GET METHODS" + '\n'
		+ "//function start(response, postData) {}" + '\n'
		+ "//function upload(response, postData) {}" + '\n'
		+ "//function jsonTest(response, postData) {}" + '\n'
		+ '\n'
		+ "// POST METHODS" + '\n'
		;

for (var i = 0; i < protocolList.length; ++i) {
	output += "function "+protocolList[i]+"(response, data) {"+'\n'
			+ '\t' + "if (flags & options['MYSQL']) mysql."+protocolList[i]+"(response, data);"+'\n'
			+ '\t' + "if (flags & options['MONGODB']) mongodb."+protocolList[i]+"(response, data);"+'\n'
			+ "}"+'\n'
			+ '\n'
			;

	tail += 'exports.' + protocolList[i] + ' = ' + protocolList[i] + ';' + '\n'
			;

}

output += tail;

fs.writeFile('requestHandler.js', output, function (err) {
	if (err) throw err;
});
