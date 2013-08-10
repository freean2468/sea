var UUID = require('./util').UUID;
var fs = require('fs');

var head = "var table = [" + '\n';

var body = '';
var tail = "];" + '\n';

tail += "\nexports.table = table;";

for (i = 0; i < 10000; ++i) {
	body += "\t'" + UUID() + "', \n";
}

var file = "kIdTable.js";
var output = head + body + tail;

fs.writeFileSync(file, output);

console.log(file + ' file has been generated.');
