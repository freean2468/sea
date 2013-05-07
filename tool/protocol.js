var version = 1;
var list = [
	'registerUser',
	'getUserInfo',
	'saveUserInfo',
	'getRanking',
];

var protocol = {
	registerUser: 505000412,
	getUserInfo: 01230010,
	saveUserInfo: 004117019,
	getRanking: 2021104,
};

exports.list = list;
exports.protocol = protocol;