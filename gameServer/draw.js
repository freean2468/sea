function DrawMgr () {
	// property
	this.list = {};

	// method
	this.push = function (id, list) {
		this.list[id] = list;
	};

	this.pull = function (id) {
		var content = this.list[id];
		delete this.list[id];
		return content;
	};
};

module.exports = {
	'DrawMgr': DrawMgr,
};
