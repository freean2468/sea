var fs = require('fs');
var path = "../data/";

function DataMgr() {
	// property
	this.characterData = [];
	this.costumeData = {};
	this.itemData = [];
	this.upgradeData = [];
	this.ghostData = [];
	this.drawData = [];
	this.drawList = [];
	this.roomData = [];

	// method
	this.init = function () {
		this.loadCharacterData();
		this.loadCostumeData();
		this.loadItemData();
		this.loadUpgradeData();
		this.loadGhostData();
		this.loadDrawData();
		this.createDrawList();

		console.log('data loading is completed.');
	};

	this.loadCharacterData = function () {
		var data = fs.readFileSync(path + 'character-data.json', 'utf8');
		data = JSON.parse(data);

		var root = data['root'];

		for (var obj in root) {
			var evolve = {};

			for (var obj in obj['evolve']) {
				var level = obj['level'];
				var cost = obj['cost'];
				
				evolve[level] = cost;
			}	
			
			var bunchOfData = {
				'id': obj['id'],
				'name': obj['name'],
				'priceType': obj['priceType'],
				'price': obj['price'],
				'evolve': evolve,
			};

			this.characterData.push(bunchOfData);
		}
	};

	this.getCharacterDataById = function (id) {
		var character = this.characterData[id - 1];

		if (character !== undefined) {
			return character;
		} else {
			return false;
		}
	};

	this.loadCostumeData = function () {
		that = this;
		function common (part) {
			var data = fs.readFileSync(path + 'costume-' + part + '-data.json', 'utf8');
			data = JSON.parse(data);

			var root = data['root'];
			var bunchOfData = [];

			for (var obj in root) {
				bunchOfData.push(obj);
			}

			that.costumeData[part] = bunchOfData;
		}

		common('head');
		common('top');
		common('bottoms');
		common('back');
	};

	this.getCostumeDataByCategoryAndId = function (category, id) {
		var costume = this.costumeData[category][id - 1];

		if (costume !== undefined) {
			return costume;
		} else {
			return false;
		}
	};

	this.loadItemData = function () {
		var data = fs.readFileSync(path + 'item-data.json', 'utf8');
		data = JSON.parse(data);

		var root = data['root'];

		for (var obj in root) {
			this.itemData.push(obj);
		}
	};

	this.getItemDataById = function (id) {
		var item = this.itemData[id - 1];

		if (item !== undefined) {
			return item;
		} else {
			return false;
		}
	};

	this.loadUpgradeData = function () {
		var data = fs.readFileSync(path + 'upgrade-data.json', 'utf8');
		data = JSON.parse(data);

		var root = data['root'];

		for (var obj in root) {
			var upgrade = {};

			for (var obj in obj['evolve']) {
				var level = obj['level'];
				var cost = obj['cost'];
				
				upgrade[level] = cost;
			}	
			
			var bunchOfData = {
				'id': obj['id'],
				'name': obj['name'],
				'upgrade': upgrade,
			};

			this.upgradeData.push(bunchOfData);
		}
	};

	this.getUpgradeDataById = function (id) {
		var upgrade = this.upgradeData[id - 1];

		if (upgrade !== undefined) {
			return upgrade;
		} else {
			return false;
		}
	};

	this.loadGhostData = function () {
		var data = fs.readFileSync(path + 'ghost-data.json', 'utf8');
		data = JSON.parse(data);

		var root = data['root'];

		for (var obj in root) {
			this.ghostData.push(obj);
		}
	};

	this.getGhostDataById = function (id) {
		var ghost = this.ghostData[id - 1];

		if (ghost !== undefined) {
			return ghost;
		} else {
			return false;
		}
	};

	this.loadDrawData = function () {
		var data = fs.readFileSync(path + 'draw-data.json', 'utf8');
		data = JSON.parse(data);

		var root = data['root'];

		for (var obj in root) {
			this.drawData.push(obj);
		}
	};

	this.getDrawDataById = function (id) {
		var content = this.drawData[id - 1];

		if (content !== undefined) {
			return content;
		} else {
			return false;
		}
	};

	this.createDrawList = function () {
		for (var i = 1; i <= 9; ++i) {
			var list = [];

			for (var j = 0; j < this.drawData.length; ++j) {
				if (this.drawData[j]['draw_rating'] === i) {
					list.push(this.drawData[j]);
				}
			}

			for (var j = 0; j < this.ghostData.length; ++j) {
				if (this.ghostData[j]['draw_rating'] === i) {
					list.push(this.ghostData[j]);
				}
			}

			this.drawList.push(list);
		}
	};

	this.loadRoomData = function () {
		var data = fs.readFileSync(path + 'item-data.json', 'utf8');
		data = JSON.parse(data);

		var root = data['root'];

		for (var obj in root) {
			this.roomData.push(obj);
		}
	};

	this.getRoomDataById = function (id) {
		var room = this.roomData[id - 1];

		if (item !== undefined) {
			return room;
		} else {
			return false;
		}
	};
}

module.exports = {
	'DataMgr': DataMgr,
};
