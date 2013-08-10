var EventEmitter = require('events').EventEmitter;
var util = require('util');

var SessionEvent = function () {
	// property
	this.list = {};

	// method
	this.insert = function (k_id, callback) {
		this.list[k_id] = callback;
	}
};

util.inherits(SessionEvent, EventEmitter);

var sessionEvent = new SessionEvent();

sessionEvent.on('systemMessage', function(k_id, res) {
	var callback = this.list[k_id];
	callback(false);
	delete this.list[k_id];
});

sessionEvent.on('register', function(k_id, session_id) {
	var callback = this.list[k_id];
	callback(session_id);
	delete this.list[k_id];
});

sessionEvent.on('unregister', function(k_id) {
	var callback = this.list[k_id];
	callback(true);
	delete this.list[k_id];
});

sessionEvent.on('update', function(k_id) {
	var callback = this.list[k_id];
	callback(true);
	delete this.list[k_id];
});

module.exports = {
	'sessionEvent': sessionEvent,
};
