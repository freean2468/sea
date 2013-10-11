var SessionEvent = function () {
	// property
	this.list = {};

	// method
	this.init = function () {

	};

	this.insert = function (key, callback) {
		this.list[key] = callback;
	};

	this.systemMessage = function (callback_id, res) {
		var callback = this.list[callback_id];

		callback(false);
		delete this.list[callback_id];
	};

	this.register = function (callback_id, session_id) {
		var callback = this.list[callback_id];

		callback(session_id);
		delete this.list[callback_id];
	};

	this.unregister = function (callback_id, k_id) {
		var callback = this.list[callback_id];

		callback(k_id);
		delete this.list[callback_id];
	};

	this.update = function (callback_id, k_id) {
		var callback = this.list[callback_id];

		callback(k_id);
		delete this.list[callback_id];
	};
};

module.exports = {
	'SessionEvent': SessionEvent,
};
