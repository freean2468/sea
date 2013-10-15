var fs = require('fs');

var head = "var table = [" + '\n';

var body = '';
var tail = "];" + '\n';

tail += "\nexports.table = table;";

for (i = 1; i <= 10000; ++i) {
	body += "\t'" + 'test_k_id_' + i + "', \n";
}

var file = './kid-table.js';
var output = head + body + tail;

fs.writeFileSync(file, output);

console.log(file + ' file has been generated.');
