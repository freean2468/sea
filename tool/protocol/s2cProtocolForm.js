#s2c#
[
	@registerAccountReply {
		'k_id':"string"
		'result':"int"
	},
	@unregisterAccountReply {
		'k_id':"string"
		'result':"int"
	},
	@startGameReply {
		'k_id':"string"
		'result':"int"
		'heart':"int"
		'last_charged_time':"long"
	},
	@accountInfo {
		'k_id':"string"
		'result':"int"
		'coin':"int"
		'mineral':"int"
		'lv':"int"
		'exp':"int"
		'point':"int"
		'heart':"int"
		'last_charged_time':"long"
		'selected_character':"int"
		'selected_assistant':"int"
		'characters':"int"
		'basic_charac_lv':"int"
		'assistants':"int"
		'basic_assist_lv':"int"
		'items':"int"
		'count':"int"
	},
	@chargeInfo {
		'k_id':"string"
		'result':"int"
		'heart':"int"
		'last_charged_time':"long"
	},
	@rankInfo {
		'k_id':"string"
		'result':"int"
		'overall_ranking':"long"
		'ranking_list':"&friendRankInfo&"
	},
	@gameResult {
		'k_id':"string"
		'result':"int"
		'score':"int"
	},
	@versionInfoReply {
		'result':"int"
	},
	@clientVerionInfoReply {
		'result':"int"
	}
];
