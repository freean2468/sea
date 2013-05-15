var packet = require('./packet');

// count, packet, {field, value}, {field, value}......
var dataForm = {
	count: 1,
	packet: packet['getRanking'],
};

exports.dataForm = dataForm;
