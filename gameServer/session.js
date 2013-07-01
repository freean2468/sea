var UUID = require('./util').UUID;
var MINUTE = require('./define').MINUTE;
var EXPIRATION = MINUTE * 15;
var unmanagedAreaMsg = [12322730, 97057879, 212532706, 70841257, 1271857080, 1415117601];
var unregisterMsg = 543619392;
var sessionList = [];
var emptyList = [];
var timerList = []; // Don't need to manage this list.

var TIMER_ON_UNREGISTER = 1;
var EXPLICIT_UNREGISTER = 0;

function setExpiration(index, piece) {
	var callback = function (index) {
		unregisterSession(index, piece);
	};

	var timerId = setTimeout(callback, EXPIRATION, index);

	timerList[index] = timerId;
}

function updateExpiration(index) {
	clearTimeout(timerList[index]);

	setExpiration(index, sessionList[index]);
}

function unregisterSession(index, piece) {
	if (sessionList[index] !== undefined && sessionList[index] === piece) {
		var emptyIndex = emptyList.indexOf(undefined);
	
		if (emptyIndex === -1) {
			emptyList.push(index);
		}
		else {
			emptyList[emptyIndex] = index;
		}

		delete sessionList[index];
	}
	else {
		throw console.log("exception happened in unregisterSession");
	}
}

function registerSession(piece) {
	var emptyIndex = sessionList.indexOf(undefined);
	var index;

	if (emptyIndex === -1) {
		index = sessionList.push(piece) - 1;
	}
	else {
		index = emptyIndex;
		sessionList[index] = piece;
	}

	setExpiration(index, piece);

	return piece;
}

function authenticateSession(msgId, piece) {
	if (unmanagedAreaMsg.indexOf(msgId) !== -1) {
		return true;
	}
	else {
		var index = sessionList.indexOf(piece);
		var res = (index !== -1);

		// There is a possibility to execute unregisterSession by timer on before explicitly.
		if (res === true) {			
			if (msgId === unregisterMsg) {
				console.log("unregisterSession");
				unregisterSession(index, piece);	
				clearTimeout(timerList[index]);
			}
			else {
				console.log("updateExpiration");
				updateExpiration(index, piece);
			}
		}

		return res;
	}
}

function CCU() {
	var count = 0;
	for (var val in sessionList) {
		if (val != undefined) {
			++count;
		}
	}
	return count;
}

exports.registerSession = registerSession;
exports.unregisterSession = unregisterSession;
exports.authenticateSession = authenticateSession;
exports.CCU = CCU;
