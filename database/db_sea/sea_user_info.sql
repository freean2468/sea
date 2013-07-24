USE sea;

DROP TABLE IF EXISTS sea_user_info;

CREATE TABLE sea.sea_user_info(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	coin MEDIUMINT NOT NULL,
	mineral MEDIUMINT NOT NULL,
	lv TINYINT NOT NULL,
	exp MEDIUMINT NOT NULL,
	point TINYINT NOT NULL,
	honey SMALLINT NOT NULL,
	last_charged_time BIGINT NOT NULL,
	selected_character TINYINT NOT NULL,
	selected_assistant TINYINT NOT NULL,

	INDEX idx_user_info_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadUserInfo $$
CREATE PROCEDURE sea_LoadUserInfo(IN p_id INT)
	BEGIN
		SELECT I.coin, I.mineral, I.lv, I.exp, I.point, I.honey, I.last_charged_time, I.selected_character, I.selected_assistant, 
				IT.exp_boost, IT.item_last, IT.max_attack, IT.random, 
				M.uv, 
				UG.honey_score, UG.honey_time, UG.cooldown,
				C.character_one, C.character_two, C.character_three, C.character_four, C.character_five, C.character_six, C.character_seven, C.character_eight, C.character_nine, C.character_ten,
				A.assistant_one, A.assistant_two, A.assistant_three, A.assistant_four, A.assistant_five, A.assistant_six, A.assistant_seven, A.assistant_eight, A.assistant_nine, A.assistant_ten
		FROM sea.sea_user_info AS I
		INNER JOIN sea.sea_user_characters AS C ON I.id = C.id
		INNER JOIN sea.sea_user_assistants AS A ON I.id = A.id
		INNER JOIN sea.sea_user_items AS IT ON I.id = IT.id
		INNER JOIN sea.sea_user_metric AS M ON I.id = M.id
		INNER JOIN sea.sea_user_upgrade AS UG ON I.id = UG.id
		WHERE I.id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadHoney $$
CREATE PROCEDURE sea_LoadHoney(IN p_id INT)
	BEGIN
		SELECT honey AS res FROM sea.sea_user_info WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadCoin $$
CREATE PROCEDURE sea_LoadCoin(IN p_id INT)
	BEGIN
		SELECT coin FROM sea.sea_user_info WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadUserBriefInfo $$
CREATE PROCEDURE sea_LoadUserBriefInfo(IN p_id INT)
	BEGIN
		SELECT coin, lv, exp FROM sea.sea_user_info WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_CheckInCharge $$
CREATE PROCEDURE sea_CheckInCharge(IN p_id INT)
	BEGIN
		SELECT last_charged_time, honey FROM sea.sea_user_info WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_StartGame $$
CREATE PROCEDURE sea_StartGame(IN p_id INT)
	BEGIN
		SELECT selected_character, selected_assistant, honey, last_charged_time
		FROM sea.sea_user_info
		WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateLevel $$
CREATE PROCEDURE sea_UpdateLevel(IN p_id INT, IN p_lv TINYINT, IN p_exp MEDIUMINT)
	BEGIN
		UPDATE sea_user_info SET lv = p_lv, exp = p_exp WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCoin $$
CREATE PROCEDURE sea_UpdateCoin(IN p_id INT, IN p_coin MEDIUMINT)
	BEGIN
		UPDATE sea_user_info SET coin = p_coin WHERE id = p_id;		
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateMineral $$
CREATE PROCEDURE sea_UpdateMineral(IN p_id INT, IN p_mineral MEDIUMINT)
	BEGIN
		UPDATE sea_user_info SET mineral = p_mineral WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdatePoint $$
CREATE PROCEDURE sea_UpdatePoint(IN p_id INT, IN p_point TINYINT)
	BEGIN
		UPDATE sea_user_info SET point = p_point WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateHoney $$
CREATE PROCEDURE sea_UpdateHoney(IN p_id INT, IN p_honey SMALLINT)
	BEGIN
		UPDATE sea_user_info SET honey = p_honey WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateLastChargeTime $$
CREATE PROCEDURE sea_UpdateLastChargeTime(IN p_id INT, IN p_updated_charged_time BIGINT)
	BEGIN
		UPDATE sea_user_info SET last_charged_time = p_updated_charged_time WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateSelectedCharacter $$
CREATE PROCEDURE sea_UpdateSelectedCharacter(IN p_id INT, IN p_selected TINYINT)
	BEGIN
		UPDATE sea_user_info SET selected_character = p_selected WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateSelectedAssistant $$
CREATE PROCEDURE sea_UpdateSelectedAssistant(IN p_id INT, IN p_selected TINYINT)
	BEGIN
		UPDATE sea_user_info SET selected_assistant = p_selected WHERE id = p_id;
	END
$$

DELIMITER ;
