var EventEmitter = require('events').EventEmitter;
var util = require('util');
var assert = require('assert');

var SessionEvent = function () {
	// property
	this.list = {};

	// method
	this.init = function () {
//		var that = this;
//
//		this.on('systemMessage', function(k_id, res) {
//			var callback = that.list[k_id];
//			callback(false);
//			delete that.list[k_id];
//		});
//
//		this.on('register', function(k_id, session_id) {
//			var callback = that.list[k_id];
//			callback(session_id);
//			delete that.list[k_id];
//		});
//
//		this.on('unregister', function(k_id) {
//			var callback = that.list[k_id];
//			callback(true);
//			delete that.list[k_id];
//		});
//
//		this.on('update', function(k_id) {
//			var callback = that.list[k_id];
//			callback(true);
//			delete that.list[k_id];
//		});
	};

	this.insert = function (k_id, callback) {
		this.list[k_id] = callback;
	};

	this.systemMessage = function (k_id, res) {
		var callback = this.list[k_id];
		assert.notEqual(callback, null);
		assert.notEqual(callback, undefined);

		callback(false);

		delete this.list[k_id];
	};

	this.register = function (k_id, session_id) {
		var callback = this.list[k_id];
		assert.notEqual(callback, null);
		assert.notEqual(callback, undefined);

		callback(session_id);

		delete this.list[k_id];
	};

	this.unregister = function (k_id) {
		var callback = this.list[k_id];
		assert.notEqual(callback, null);
		assert.notEqual(callback, undefined);

		callback(true);

		delete this.list[k_id];
	};

	this.update = function (k_id) {
		var callback = this.list[k_id];
		assert.notEqual(callback, null);
		assert.notEqual(callback, undefined);

		callback(true);

		delete this.list[k_id];
	};
};

//util.inherits(SessionEvent, EventEmitter);

module.exports = {
	'SessionEvent': SessionEvent,
};
