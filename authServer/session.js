var g2a_proto = require('./g2a-proto');
var UUID = require('../common/util').UUID;

var	MINUTE = require('../common/define').MINUTE,
	EXPIRATION = MINUTE * 15;

function SessionMgr(logMgr) {
	// property
	this.sessionList = {};
	this.timerList = {};
	this.logMgr = logMgr;

	// method
	this.registerSession = function (kId) {
		var sessionId = UUID();

		if (this.sessionList[kId] !== undefined && this.sessionList[kId] !== null) {
			//this.logMgr.addLog('ERROR', 'Duplicated Auth. (' + kId + ')');
			//return false;
			this.logMgr.addLog('AUTH', 'Reregister session. (' + kId + ', ' + sessionId + ')');
			this.sessionList[kId] = null;
			clearTimeout(this.timerList[kId]);
			this.timerList[kId] = null;
		} else {
			this.logMgr.addLog('AUTH', 'Register new session. (' + kId + ', ' + sessionId + ')');
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
			
			this.logMgr.addLog('AUTH', 'Unregister session. (' +kId + ', ' + sessionId + ')');
			return true;
		} else {
			this.logMgr.addLog('ERROR', 'A wrong access was detected in unregisterSession. (' + kId + ', ' + sessionId + ')');
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
//			this.logMgr.addLog('AUTH', 'Update session. (' + kId + ', ' + sessionId + ')');
			return true;
		} else {
			this.logMgr.addLog('ERROR', 'A wrong access was detected in updateSession. (' + kId + ', ' + sessionId + ')');
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
	'SessionMgr': SessionMgr,
};
