var g2a_proto = require('./g2a-proto');
var UUID = require('../common/util').UUID;

var	MINUTE = require('../common/define').MINUTE,
	EXPIRATION = MINUTE * 15;

var sessionMgr = new SessionManager;

function SessionManager() {
	// property
	this.sessionList = {};
	this.timerList = {};

	// method
	this.registerSession = function (kId) {
		var sessionId = UUID();

		if (this.sessionList[kId] != null) {
			return false;
		}

		this.sessionList[kId] = sessionId;
		this.setExpiration(kId, sessionId);

		return sessionId;
	};

	this.unregisterSession = function (kId, sessionId) {
		var _sessionId = this.sessionList[kId];

		if (_sessionId !== null && _sessionId === sessionId) {
			this.sessionList[kId] = null;
			clearTimeout(this.timerList[kId]);
			this.timerList[kId] = null;
			
			return true;
		} else {
			console.log('A wrong access was detected in unregisterSession. (' + kId + ', ' + sessionId + ')');
			return false;
		}
	};

	this.setExpiration = function (kId, sessionId) {
		var that = this;
		var callback = function (kId) {
			that.unregisterSession(kId, sessionId);
		};

		var timerId = setTimeout(callback, EXPIRATION, kId);

		this.timerList[kId] = timerId;
	};

	this.updateSession = function (kId, sessionId) {
		var _sessionId = this.sessionList[kId];

		if (_sessionId !== null && _sessionId === sessionId) {
			clearTimeout(this.timerList[kId]);
			this.setExpiration(kId, sessionId);
			return true;
		} else {
			console.log('A wrong access was detected in updateSession. (' + kId + ', ' + sessionId + ')');
			return false;
		}
	};

	this.CCU = function () {
		var count = 0;
		for (var val in this.sessionList) {
			if (this.sessionList[val] != null) {
				++count;
			}
		}
		return count;
	};
}

module.exports = {
	'sessionMgr': sessionMgr,
};
