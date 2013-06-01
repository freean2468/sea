#c2s#
[
	@registerAccount {
		'k_id':"string"
	},
	@unregisterAccount {
		'k_id':"string"
	},
	@loadUserInfo {
		'k_id':"string"
	},
	@checkInCharge {
		'k_id':"string"
	},
	@startGame {
		'k_id':"string"
		'selected_character':"int"
		'selected_assistant':"int"
	},
	@endGame {
		'k_id':"string"
		'dist':"int"
		'kill':"int"
		'usedItem':"int"
	},
	@loadRankInfo {
		'k_id':"string"
	},
	@requestPointReward {
		'k_id':"string"
		'point':"int"
	}
];
