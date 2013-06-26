var fs = require('fs');
var path = "../client/";
var arg = [];

process.argv.forEach(function(val, index, array) {
	if (index >= 2) {
		arg.push(val);
	}
});

for (i = 0; i < arg.length; ++i) {
	var file = path + arg[i] + "_ut.cs";	
	var output = "";
	var input = fs.readFileSync(file) + "";
	
	while (1) {
		var pos = 0;
		var EOL = input.slice(pos).search('\n');
		var line = input.slice(pos, EOL) + '\n';
		
		if (line.search("ponentModel.DefaultValue") === -1 ) {
			output += line;
		}

		if (EOL === -1) {
			break;
		}

		pos = EOL+1;

		input = input.slice(pos);		
	}

	output += '}';

	fs.writeFileSync(path + arg[i] + ".cs", output);
}
