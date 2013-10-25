var SECOND = 1000;
var MINUTE = SECOND * 60;
var weekday = Array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');

var Parts = [
	'Head',
	'Top',
	'Pants',
	'Back',
];

var E_Item = [
	'Shield',
	'ItemLast',	// Increase_Item_Time
	'Ghostify', // Revive
	'Immortal', // Super_Start
	'ExpBoost', // Double_Exp
	'Random', // Random
];

var E_Match_Card = [
	'None',
	'Magnetic',
	'Add_Score',
	'Add_Exp',
	'Add_Coin',
	'Bonus_Hp',
	'Revival',
	'Item_Time',
];

module.exports = {
	'SECOND': SECOND,
	'MINUTE': MINUTE,
	'weekday': weekday,
	'Parts': Parts,
	'E_Item': E_Item,
	'E_Match_Card': E_Match_Card,
};
