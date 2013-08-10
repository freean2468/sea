var server = [],
	protoList = [];

var serverOn = false,
	protoOn = false;

process.argv.forEach(function(val, index, array) {
	if (index > 1) {
		if (val === '-server') {
			serverOn = true;
			return;
		} else if (val === '-proto') {
			serverOn = false;
			protoOn = true;
			return;
		}

		if (serverOn === true) {
			server.push(val);
		} else if (protoOn === true) {
			protoList.push(val);
		}
	}
});

var protoIdList = [];

for (var i = 0; i < protoList.length; ++i) {
	protoIdList.push(require('./' + protoList[i] + '-id'));
}

var fs = require('fs');

for (var k = 0, l = server.length; k < l; ++k) {
	var what = server[k];
	var output = '';
	var tail = '';

	output += "var mysql = require('./" + what + "-handler-mysql');" + '\n'
			+ "var mongodb = require('./" + what + "-handler-mongodb');" + '\n'
			+ "var options = {MYSQL: 1, MONGODB: 2};" + '\n'
			+ "var flags = options['MYSQL'] /*+ options['MONGODB']*/;" + '\n'
			+ '\n'
			;

	for (var i = 0; i < protoIdList.length; ++i) {
		for (var j = 0; j < protoIdList[i].list.length; ++j) {
			output += "function "+protoIdList[i].list[j]+"Handler(response, data, session_id) {"+'\n'
					+ '\t' + "if (flags & options['MYSQL']) mysql."+protoIdList[i].list[j]+"Handler(response, data, session_id);"+'\n'
					+ '\t' + "if (flags & options['MONGODB']) mongodb."+protoIdList[i].list[j]+"Handler(response, data, session_id);"+'\n'
					+ "}"+'\n'
					+ '\n'
					;

			tail += 'exports.' + protoIdList[i].list[j] + 'Handler = ' + protoIdList[i].list[j] + 'Handler;' + '\n'
					;
		}
	}

	output += tail;

	fs.writeFileSync(what + '-handler.js', output);
	console.log(what + '-handler.js file has been generated');
}
