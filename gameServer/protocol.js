// Version

var versionInfo = {
	id: 979162,
	version: 0.4,
}; // end versionInfo

var clientVersionInfo = {
	id: -188222551,
	version: 0.1,
}; // end clientVersionInfo

// C2S

var registerAccount = {
	id: 1791621329,
	k_id: '',
}; // end registerAccount

var unregisterAccount = {
	id: 1727001234,
	k_id: '',
}; // end unregisterAccount

var loadUserInfo = {
	id: 19331440,
	k_id: '',
}; // end loadUserInfo

var checkInCharge = {
	id: 890369080,
	k_id: '',
}; // end checkInCharge

var startGame = {
	id: 193227,
	k_id: '',
	selected_character: 0,
	selected_assistant: 0,
}; // end startGame

var endGame = {
	id: 1309014912,
	k_id: '',
	dist: 0,
	kill: 0,
	usedItem: 0,
}; // end endGame

var loadRankInfo = {
	id: 1963864,
	k_id: '',
}; // end loadRankInfo

var requestPointReward = {
	id: -239339370,
	k_id: '',
	point: 0,
}; // end requestPointReward

// S2C

var registerAccountReply = {
	id: -561450825,
	k_id: '',
	result: 0,
}; // end registerAccountReply

var unregisterAccountReply = {
	id: -734332534,
	k_id: '',
	result: 0,
}; // end unregisterAccountReply

var startGameReply = {
	id: -803210640,
	k_id: '',
	result: 0,
	heart: 0,
	last_charged_time: 0,
}; // end startGameReply

var accountInfo = {
	id: 86832461,
	k_id: '',
	result: 0,
	coin: 0,
	mineral: 0,
	lv: 0,
	exp: 0,
	point: 0,
	heart: 0,
	last_charged_time: 0,
	selected_character: 0,
	selected_assistant: 0,
	characters: 0,
	basic_charac_lv: 0,
	assistants: 0,
	basic_assist_lv: 0,
	items: 0,
	count: 0,
}; // end accountInfo

var chargeInfo = {
	id: 8843447,
	k_id: '',
	result: 0,
	heart: 0,
	last_charged_time: 0,
}; // end chargeInfo

var rankInfo = {
	id: 1049161728,
	k_id: '',
	result: 0,
	overall_ranking: 0,
	rank_list: [],
}; // end rankInfo

var gameResult = {
	id: 7142187,
	k_id: '',
	result: 0,
	score: 0,
}; // end gameResult

var versionInfoReply = {
	id: -304875355,
	result: 0,
}; // end versionInfoReply

var clientVerionInfoReply = {
	id: 2005400364,
	result: 0,
}; // end clientVerionInfoReply

// R2G

var requestRankingReply = {
	id: -562433242,
	k_id: '',
	result: 0,
	overall_ranking: 0,
}; // end requestRankingReply

// G2R

var requestRanking = {
	id: -2143814018,
	k_id: '',
	result: 0,
}; // end requestRanking

exports.versionInfo = versionInfo;
exports.clientVersionInfo = clientVersionInfo;
exports.registerAccount = registerAccount;
exports.unregisterAccount = unregisterAccount;
exports.loadUserInfo = loadUserInfo;
exports.checkInCharge = checkInCharge;
exports.startGame = startGame;
exports.endGame = endGame;
exports.loadRankInfo = loadRankInfo;
exports.requestPointReward = requestPointReward;
exports.registerAccountReply = registerAccountReply;
exports.unregisterAccountReply = unregisterAccountReply;
exports.startGameReply = startGameReply;
exports.accountInfo = accountInfo;
exports.chargeInfo = chargeInfo;
exports.rankInfo = rankInfo;
exports.gameResult = gameResult;
exports.versionInfoReply = versionInfoReply;
exports.clientVerionInfoReply = clientVerionInfoReply;
exports.requestRankingReply = requestRankingReply;
exports.requestRanking = requestRanking;
