var g2a_proto = require('./g2a-proto');
var UUID = require('../common/util').UUID;

var	MINUTE = require('../common/define').MINUTE,
	EXPIRATION = MINUTE * 15;

function SessionMgr(logMgr) {
	// property
	this.sessionInfoList = {}; // key : session, value : kId
	this.sessionList = {}; // key : kId, value : session
	this.timerList = {};
	this.logMgr = logMgr;
	this.traceList = {};

	// method
	this.registerSession = function (kId) {
		var sessionId = UUID();

		if (typeof this.sessionList[kId] !== 'undefined' && this.sessionList[kId] !== null) {
			//this.logMgr.addLog('ERROR', 'Duplicated Auth. (' + kId + ')');
			//return false;
			var _sessionId = this.sessionList[kId];
			this.logMgr.addLog('AUTH', 'Re-register session for ' + kId + ' before is ' + _sessionId + ')');
			this.sessionList[kId] = null;
			this.sessionInfoList[_sessionId] = null;
			clearTimeout(this.timerList[_sessionId]);
			this.timerList[_sessionId] = null;

			if (typeof this.traceList[sessionId] !== 'undefined' && this.traceList[sessionId] !== null) {
				this.traceList[_sessionId] = null;
			}
		} else {
			this.logMgr.addLog('AUTH', 'Register new session. (' + kId + ', ' + sessionId + ')');
		}
		this.sessionList[kId] = sessionId;
		this.sessionInfoList[sessionId] = kId;
		this.setExpiration(sessionId);

		return sessionId;
	};

	this.unregisterSession = function (sessionId) {
		var _kId = this.sessionInfoList[sessionId];

		if (_kId !== null && typeof _kId !== 'undefined') {
			this.sessionList[_kId] = null;
			this.sessionInfoList[sessionId] = null;
			clearTimeout(this.timerList[sessionId]);
			this.timerList[sessionId] = null;
			
			this.logMgr.addLog('AUTH', 'Unregister session. (session: ' + sessionId + ', kId : ' + _kId + ')');
			return _kId;
		} else {
			this.logMgr.addLog('ERROR', 'A wrong access was detected in unregisterSession. (' + sessionId + ')');
			return false;
		}
	};

	this.setExpiration = function (sessionId) {
		var that = this;
		var callback = function (sessionId) {
			that.unregisterSession(sessionId);
		};

		var timerId = setTimeout(callback, EXPIRATION, sessionId);

		this.timerList[sessionId] = timerId;
	};

	this.updateSession = function (sessionId) {
		var _kId = this.sessionInfoList[sessionId];

		if (_kId !== null && typeof _kId !== 'undefined') {
			clearTimeout(this.timerList[sessionId]);
			this.setExpiration(sessionId);
//			this.logMgr.addLog('AUTH', 'Update session. (' + kId + ', ' + sessionId + ')');
			return _kId;
		} else {
			this.logMgr.addLog('ERROR', 'A wrong access was detected in updateSession. (' + sessionId + ')');
			return false;
		}
	};

	this.updateEndGameSession = function (sessionId) {
		var _kId = this.sessionInfoList[sessionId];

		if (_kId !== null && typeof _kId !== 'undefined') {
			var traceData = this.traceList[sessionId];

			this.traceList[sessionId] = null;
			clearTimeout(this.timerList[sessionId]);
			this.setExpiration(sessionId);
//			this.logMgr.addLog('AUTH', 'Update session. (' + kId + ', ' + sessionId + ')');
			return {
				'k_id': _kId, 
				'start_game': traceData['start_game'], 
				'double_exp': traceData['double_exp'],
			};
		} else {
			this.logMgr.addLog('ERROR', 'A wrong access was detected in updateSession. (' + sessionId + ')');
			return false;
		}
	};

	this.traceStartGame = function (data) {
		var sessionId = data['session_id'];
		var startTime = data['start_time'];
		var doubleExp = data['double_exp'];

		this.traceList[sessionId] = {
			'start_time': startTime,
			'double_exp': doubleExp,
		};
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
