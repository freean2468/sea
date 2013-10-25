var fs = require('fs');
var path = "../data/";

function DataMgr() {
	// property
	this.characterData = [];
	this.costumeData = [];
	this.itemData = [];
	this.ghostData = [];
	this.houseData = [];
	this.levelData = [];
	this.drawData = [];
	this.drawList = [];

	// method
	this.init = function () {
		this.loadCharacterData();
		this.loadCostumeData();
		this.loadItemData();
		this.loadGhostData();
		this.loadDrawData();
		this.loadHouseData();
		this.loadLevelData();
		this.createDrawList();

		console.log('data loading is completed.');
	};

	this.loadCharacterData = function () {
		var data = fs.readFileSync(path + 'CharacterStatus.json', 'utf8');
		data = JSON.parse(data);

		var root = data['root'];
		var table = [];

		for (var index in root) {
			var item = root[index];
			var prev = root[index - 1];

			if (typeof item === 'undefined') {
				this.characterData.push(table);
				break;
			}

			if (typeof prev !== 'undefined' && item['Char_ID'] !== prev['Char_ID']) {
				this.characterData.push(table);
				table = [];
			}

			table.push({
				'ID': item['Char_ID'],
				'Level': item['Char_Lv'],
				'Char_Coin': item['Char_Coin'],
				'Char_Score': item['Char_Score'],
				'Char_Exp': item['Char_Exp'],
				'Price_Coin': item['Upgrade_Coin'],
				'Price_Cash': item['Upgrade_Cash'],
			});
		}
	};

	this.getCharacterDataByIdAndLv = function (id, lv) {
		var character = this.characterData[id - 1][lv - 1];

		if (typeof character !== 'undefined') {
			return character;
		} else {
			return false;
		}
	};

	this.loadCostumeData = function () {
		var data = fs.readFileSync(path + 'CharacterCostumeInfo.json', 'utf8');
		data = JSON.parse(data);

		var root = data['root'];
		var bunchOfData = [];

		for (var index in root) {
			var item = root[index];
			this.costumeData.push({
				'ID': item['Costume_Set_ID'],
				'Price_Coin': item['Price_Coin'],
				'Price_Cash': item['Price_Cash'],
				'Costume_Type': item['Costume_Type'],
				'Costume_Coin': item['Costume_Coin'],
				'Costume_Score': item['Costume_Score'],
				'Costume_Exp': item['Costume_Exp'],
				'Time_Reduce': item['Time_Reduce'],
			});
		}
	};

	this.getCostumeDataById = function (id) {
		var costume = this.costumeData[id - 1];

		if (typeof costume !== 'undefined') {
			return costume;
		} else {
			return false;
		}
	};

	this.loadItemData = function () {
		var data = fs.readFileSync(path + 'BoostItemData.json', 'utf8');
		data = JSON.parse(data);

		var root = data['root'];

		for (var index in root) {
			var item = root[index];
			this.itemData.push({
				'ID': item['ID'],
				'Type': item['Boost_Item_Type'],
				'Price_Coin': item['Price_Coin'],
			});
		}
	};

	this.getItemDataById = function (id) {
		var item = this.itemData[id - 1];

		if (typeof item !== 'undefined') {
			return item;
		} else {
			return false;
		}
	};

	this.loadGhostData = function () {
		var data = fs.readFileSync(path + 'GhostCardInfo.json', 'utf8');
		data = JSON.parse(data);

		var root = data['root'];

		for (var index in root) {
			var item = root[index];			
			this.ghostData.push({
				'ID': item['Card_ID'],
				'Level': item['Card_Lv'],
				'Pick_Prob': item['Pick_Prob'],
				'Card_Coin': item['Card_Coin'],
				'Card_Score': item['Card_Score'],
				'Card_Exp': item['Card_Exp'],
				'Coin_Time': item['Coin_Time'],
				'Make_Coin': item['Make_Coin'],
				'Cash_Time': item['Crystal_Time'],
				'Make_Cash': item['Make_Crystal'],
				'Energy_Time': item['Heart_Time'],
				'Make_Energy': item['Make_Heart'],
				'Mileage_Time': item['Soul_Time'],
				'Make_Mileage': item['Make_Soul'],
				'Item_Time': item['Item_Time'],
				'Make_Item': item['Make_Item'],
			});
		}
	};

	this.getGhostDataById = function (id) {
		var ghost = this.ghostData[id - 1];

		if (typeof ghost !== 'undefined') {
			return ghost;
		} else {
			return false;
		}
	};

	this.loadDrawData = function () {
		var data = fs.readFileSync(path + 'draw-data.json', 'utf8');
		data = JSON.parse(data);

		var root = data['root'];

		for (var index in root) {
			this.drawData.push(root[index]);
		}
	};

	this.getDrawDataById = function (id) {
		var content = this.drawData[id - 1];

		if (typeof content !== 'undefined') {
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

	this.loadHouseData = function () {
		var data = fs.readFileSync(path + 'GhostHouseData.json', 'utf8');
		data = JSON.parse(data);

		var root = data['root'];

		for (var idx in root) {
			var item = root[idx];
			this.houseData.push({
				'ID': item['House_ID'],
				'Price_Coin': item['Price_Coin'],
				'Price_Cash': item['Price_Cash'],
				'Match_Card_ID': item['Match_Card_ID'],
				'Match_Card_Bonus_Effect_Type': item['Match_Card_Bonus_Effect_Type'],
				'Match_Card_Bonus_Effect_Value': item['Match_Card_Bonus_Effect_Value'],
			});
		}
	};

	this.getHouseDataById = function (id) {
		var house = this.houseData[id - 1];

		if (typeof item !== 'undefined') {
			return house;
		} else {
			return false;
		}
	};

	this.loadLevelData = function () {
		var data = fs.readFileSync(path + 'LevelData.json', 'utf8');
		data = JSON.parse(data);

		var root = data['root'];

		for (var idx in root) {
			var item = root[idx];
			this.levelData.push(item);
		}
	};

	this.getLevelData = function (level) {
		var data = this.levelData[(level - 1)];

		if (typeof data !== 'undefined') {
			return data;
		} else {
			return false;
		}
	};
}

module.exports = {
	'DataMgr': DataMgr,
};
