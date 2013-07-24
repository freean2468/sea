var c2s = [
	{'type': 'enum', '0': 'Pack', '1': 'BASIC= 1;', }, 
	{'type': 'enum', '0': 'ID', '1': 'ONE= 1;', '2': 'TWO = 2;', '3': 'THREE = 3;', '4': 'FOUR = 4;', '5': 'FIVE = 5;', '6': 'SIX = 6;', '7': 'SEVEN = 7;', '8': 'EIGHT = 8;', '9': 'NINE = 9;', '10': 'TEN = 10;', }, 
	{'type': 'enum', '0': 'Item', '1': 'EXP_BOOST = 1;', '2': 'LAST_ITEM = 2;', '3': 'MAX_ATTACK = 3;', '4': 'RANDOM = 4;', }, 
	{'type': 'enum', '0': 'Character', '1': 'ONE = 1;', '2': 'TWO = 2;', '3': 'THREE = 3;', '4': 'FOUR = 4;', '5': 'FIVE = 5;', '6': 'SIX = 6;', '7': 'SEVEN = 7;', '8': 'EIGHT = 8;', '9': 'NINE = 9;', '10': 'TEN = 10;', }, 
	{'type': 'enum', '0': 'Assistant', '1': 'ONE = 1;', '2': 'TWO = 2;', '3': 'THREE = 3;', '4': 'FOUR = 4;', '5': 'FIVE = 5;', '6': 'SIX = 6;', '7': 'SEVEN = 7;', '8': 'EIGHT = 8;', '9': 'NINE = 9;', '10': 'TEN = 10;', }, 
	{'type': 'msg', '0': 'VersionInfo', '1': 'required string version = 2;', }, 
	{'type': 'msg', '0': 'RegisterAccount', '1': 'required string k_id = 2;', }, 
	{'type': 'msg', '0': 'UnregisterAccount', '1': 'required string k_id = 2;', }, 
	{'type': 'msg', '0': 'Login', '1': 'required string k_id = 2;', }, 
	{'type': 'msg', '0': 'Logout', '1': 'required string k_id = 2;', }, 
	{'type': 'msg', '0': 'CheckInCharge', '1': 'required string k_id = 2;', }, 
	{'type': 'msg', '0': 'SelectCharacter', '1': 'required string k_id = 2;', '2': 'required int32 selected_character = 3;', }, 
	{'type': 'msg', '0': 'SelectAssistant', '1': 'required string k_id = 2;', '2': 'required int32 selected_assistant = 3;', }, 
	{'type': 'msg', '0': 'StartGame', '1': 'required string k_id = 2;', '2': 'required int32 selected_character = 3;', '3': 'required int32 selected_assistant = 4;', }, 
	{'type': 'msg', '0': 'EndGame', '1': 'required string k_id = 2;', '2': 'required int32 selected_character = 3;', '3': 'required int32 selected_assistant = 4;', '4': 'required int32 score = 5;', '5': 'required int32 dist = 6;', '6': 'required int32 enemy_kill = 7;', '7': 'required int32 play_time = 8;', '8': 'required int32 coin = 9;', }, 
	{'type': 'msg', '0': 'LoadRankInfo', '1': 'required string k_id = 2;', }, 
	{'type': 'msg', '0': 'LoadPostedHoney', '1': 'required string k_id = 2;', }, 
	{'type': 'msg', '0': 'LoadPostedBaton', '1': 'required string k_id = 2;', }, 
	{'type': 'msg', '0': 'LoadPostedBatonResult', '1': 'required string k_id = 2;', }, 
	{'type': 'msg', '0': 'RequestPointReward', '1': 'required string k_id = 2;', '2': 'required int32 point = 3;', }, 
	{'type': 'msg', '0': 'BuyItem', '1': 'required string k_id = 2;', '2': 'required Item item = 3;', }, 
	{'type': 'msg', '0': 'BuyCharacter', '1': 'required string k_id = 2;', '2': 'required Character character = 3;', }, 
	{'type': 'msg', '0': 'BuyAssistant', '1': 'required string k_id = 2;', '2': 'required Assistant assistant = 3;', }, 
	{'type': 'msg', '0': 'SendHoney', '1': 'required string k_id = 2;', '2': 'required string receiver_k_id = 3;', }, 
	{'type': 'msg', '0': 'AcceptHoney', '1': 'required string k_id = 2;', '2': 'required string sender_k_id = 3;', '3': 'required int64 sended_time = 4;', }, 
	{'type': 'msg', '0': 'RequestBaton', '1': 'required string k_id = 2;', '2': 'required string receiver_k_id = 3;', '3': 'required string map = 4;', '4': 'required int32 score = 5;', }, 
	{'type': 'msg', '0': 'AcceptBaton', '1': 'required string k_id = 2;', '2': 'required string sender_k_id = 3;', '3': 'required int64 sended_time = 4;', '4': 'required int32 selected_character = 5;', '5': 'required int32 selected_assistant = 6;', }, 
	{'type': 'msg', '0': 'EndBaton', '1': 'required string k_id = 2;', '2': 'required string sender_k_id = 3;', '3': 'required int64 sended_time = 4;', '4': 'required int32 selected_character = 5;', '5': 'required int32 selected_assistant = 6;', '6': 'required int32 score = 7;', '7': 'required int32 dist = 8;', '8': 'required int32 enemy_kill = 9;', '9': 'required int32 play_time = 10;', '10': 'required int32 coin = 11;', }, 
	{'type': 'msg', '0': 'AcceptBatonResult', '1': 'required string k_id = 2;', '2': 'required string sender_k_id = 3;', '3': 'required int64 sended_time = 4;', }, 
	{'type': 'msg', '0': 'UpgradeHoneyScore', '1': 'required string k_id = 2;', }, 
	{'type': 'msg', '0': 'UpgradeHoneyTime', '1': 'required string k_id = 2;', }, 
	{'type': 'msg', '0': 'UpgradeCooldown', '1': 'required string k_id = 2;', }, 
	{'type': 'msg', '0': 'UpgradeMaxAttack', '1': 'required string k_id = 2;', '2': 'required ID character_id = 3;', }, 
	{'type': 'msg', '0': 'UpgradePet', '1': 'required string k_id = 2;', '2': 'required ID pet_id = 3;', }, 
];


var s2c = [
	{'type': 'enum', '0': 'Result', '1': 'TRUE = 1;', '2': 'INVALID_ACCOUNT= 2;', '3': 'UNDEFINED_FIELD= 3;', '4': 'EXISTED_ACCOUNT= 4;', '5': 'BLOCKED_ACCOUNT= 5;', '6': 'DUPLICATED_LOGIN = 6;', '7': 'INVALID_CHARACTER = 7;', '8': 'INVALID_ASSISTANT = 8;', '9': 'INVALID_ITEM = 9;', '10': 'NOT_ENOUGH_HONEY = 10;', '11': 'NOT_ENOUGH_COIN = 11;', '12': 'NO_MATCH_WITH_DB = 12;', '13': 'INVALID_REQ_FIELD = 13;', '14': 'INVALID_BATON = 14;', '15': 'INVALID_BATON_RESULT = 15;', '16': 'INVALID_HONEY = 16;', '17': 'FULLY_UPGRADED = 17;', }, 
	{'type': 'enum', '0': 'Update', '1': 'SUCCESS = 1;', '2': 'FAIL = 2;', }, 
	{'type': 'enum', '0': 'ID', '1': 'ONE = 1;', '2': 'TWO = 2;', '3': 'THREE = 3;', '4': 'FOUR = 4;', '5': 'FIVE = 5;', '6': 'SIX = 6;', '7': 'SEVEN = 7;', '8': 'EIGHT = 8;', '9': 'NINE = 9;', '10': 'TEN = 10;', }, 
	{'type': 'enum', '0': 'Item', '1': 'EXP_BOOST = 1;', '2': 'LAST_ITEM = 2;', '3': 'MAX_ATTACK = 3;', '4': '', '5': 'MAGNET = 21;', '6': 'COIN_TIME = 22;', '7': 'SCORE_BONUS = 23;', '8': 'HEALTH = 24;', '9': 'IMMORTAL = 25;', '10': 'COOL_DOWN = 26;', '11': 'HONEY_SCORE = 27;', '12': 'LAST_ACTION = 28;', '13': 'MAX = 29;', }, 
	{'type': 'enum', '0': 'Character', '1': 'ONE = 1;', '2': 'TWO = 2;', '3': 'THREE = 3;', '4': 'FOUR = 4;', '5': 'FIVE = 5;', '6': 'SIX = 6;', '7': 'SEVEN = 7;', '8': 'EIGHT = 8;', '9': 'NINE = 9;', '10': 'TEN = 10;', }, 
	{'type': 'enum', '0': 'Assistant', '1': 'ONE = 1;', '2': 'TWO = 2;', '3': 'THREE = 3;', '4': 'FOUR = 4;', '5': 'FIVE = 5;', '6': 'SIX = 6;', '7': 'SEVEN = 7;', '8': 'EIGHT = 8;', '9': 'NINE = 9;', '10': 'TEN = 10;', }, 
	{'type': 'msg', '0': 'SystemMessage', '1': 'required Result res = 2;', }, 
	{'type': 'msg', '0': 'VersionInfoReply', '1': 'required string version = 2;', }, 
	{'type': 'msg', '0': 'RegisterAccountReply', }, 
	{'type': 'msg', '0': 'SelectCharacterReply', }, 
	{'type': 'msg', '0': 'SelectAssistantReply', }, 
	{'type': 'msg', '0': 'StartGameReply', '1': 'required int32 honey = 2;', '2': 'required int64 last_charged_time = 3;', }, 
	{'type': 'msg', '0': 'AccountInfo', '1': 'required int32 coin = 2;', '2': 'required int32 mineral = 3;', '3': 'required int32 lv = 4;', '4': 'required int32 exp = 5;', '5': 'required int32 point = 6;', '6': 'required int32 honey = 7;', '7': 'required int64 last_charged_time = 8;', '8': 'required int32 selected_character = 9;', '9': 'required int32 selected_assistant = 10;', '10': 'required int32 honey_score = 11;', '11': 'required int32 honey_time = 12;', '12': 'required int32 cooldown = 13;', '13': 'required int32 exp_boost = 14;', '14': 'required int32 item_last = 15;', '15': 'required int32 max_attack = 16;', '16': 'required int32 random = 17;', '17': 'repeated CharacterInfo characters = 18;', '18': 'repeated AssistantInfo assistants = 19;', '19': 'required ID id = 1;', '20': 'required int32 upgraded = 2;		', '21': 'required ID id = 1;', '22': 'required int32 upgraded = 2;', }, 
	{'type': 'msg', '0': 'LogoutReply', }, 
	{'type': 'msg', '0': 'ChargeInfo', '1': 'required int32 honey = 2;', '2': 'required int64 last_charged_time = 3;', }, 
	{'type': 'msg', '0': 'RankInfo', '1': 'required int64 overall_ranking = 2;', '2': 'repeated FriendRankInfo ranking_list = 3;', '3': 'required string k_id = 1;', '4': 'required int32 score = 2;', '5': 'required int32 honey_sended = 3;', }, 
	{'type': 'msg', '0': 'PostedHoney', '1': 'repeated Honey honey = 2;', '2': 'required string sender_k_id = 1;', '3': 'required int64 sended_time = 2;', }, 
	{'type': 'msg', '0': 'PostedBaton', '1': 'repeated Baton baton = 2;', '2': 'required string sender_k_id = 1;', '3': 'required string map_name = 2;', '4': 'required int32 last_score = 3;', '5': 'required int64 sended_time = 4;', }, 
	{'type': 'msg', '0': 'PostedBatonResult', '1': 'repeated BatonResult baton_result = 2;', '2': 'required string sender_k_id = 1;', '3': 'required int32 acquisition_score = 2;', '4': 'required int64 sended_time = 3;', }, 
	{'type': 'msg', '0': 'GameResult', '1': 'required int32 score = 2;', '2': 'required int32 coin = 3;', '3': 'required int32 bonus_score = 4;', '4': 'required int32 total_score = 5;', '5': 'required int32 level = 6;', '6': 'required int32 exp = 7;', '7': 'required int32 total_coin = 8;', }, 
	{'type': 'msg', '0': 'BuyItemReply', '1': 'required Item item = 2;', }, 
	{'type': 'msg', '0': 'BuyCharacterReply', '1': 'required Character character = 2;', }, 
	{'type': 'msg', '0': 'BuyAssistantReply', '1': 'required Assistant assistant = 2;', }, 
	{'type': 'msg', '0': 'SendHoneyReply', }, 
	{'type': 'msg', '0': 'RequestBatonReply', '1': 'required int32 coin = 2;', }, 
	{'type': 'msg', '0': 'AcceptHoneyReply', }, 
	{'type': 'msg', '0': 'AcceptBatonReply', }, 
	{'type': 'msg', '0': 'BatonResult', '1': 'required int32 coin = 2;', '2': 'required int32 total_coin = 3;', '3': 'required Update update = 4;', }, 
	{'type': 'msg', '0': 'AcceptBatonResultReply', '1': 'required Update update = 2;', '2': 'required int32 score = 3;', }, 
	{'type': 'msg', '0': 'UpgradeReply', '1': 'required int32 coin = 2;', }, 
];


var root = [
	{'namespace': 'c2s', 'table': c2s}, 
	{'namespace': 's2c', 'table': s2c}, 
];

exports.root = root;
