USE sea;

########################
##
########################
DROP TABLE IF EXISTS sea_user_info;

CREATE TABLE sea.sea_user_info(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	coin MEDIUMINT NOT NULL,
	mineral SMALLINT NOT NULL,
	lv TINYINT NOT NULL,
	exp MEDIUMINT NOT NULL,
	point TINYINT NOT NULL,
	heart TINYINT NOT NULL,
	last_charged_time BIGINT NOT NULL,
	selected_character SMALLINT NOT NULL,
	selected_assistant SMALLINT NOT NULL,

	INDEX idx_user_info_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$
DROP PROCEDURE IF EXISTS sea_LoadUserInfo $$
CREATE PROCEDURE sea_LoadUserInfo(IN p_id INT)
	BEGIN
		SELECT U.k_id, I.coin, I.mineral, I.lv, I.exp, I.point, I.heart, I.last_charged_time, 
				I.selected_character, I.selected_assistant, C.characters, C.basic_charac_lv,
				A.assistants, A.basic_assist_lv, IT.items, IT.count, M.uv
		FROM sea.sea_user_info AS I
		INNER JOIN sea.sea_user AS U ON I.id = U.id
		INNER JOIN sea.sea_user_characters AS C ON I.id = C.id
		INNER JOIN sea.sea_user_assistants AS A ON I.id = A.id
		INNER JOIN sea.sea_user_items AS IT ON I.id = IT.id
		INNER JOIN sea.sea_user_metric AS M ON I.id = M.id
		WHERE I.id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_CheckInCharge $$
CREATE PROCEDURE sea_CheckInCharge(IN p_id INT)
	BEGIN
		SELECT last_charged_time, heart FROM sea.sea_user_info WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_StartGame $$
CREATE PROCEDURE sea_StartGame(IN p_id INT)
	BEGIN
		SELECT selected_character, selected_assistant, heart, last_charged_time
		FROM sea.sea_user_info
		WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateLevel $$
CREATE PROCEDURE sea_UpdateLevel(IN p_id INT, IN p_lv INT, IN p_exp INT)
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
CREATE PROCEDURE sea_UpdateMineral(IN p_id INT, IN p_mineral SMALLINT)
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

DROP PROCEDURE IF EXISTS sea_UpdateHeart $$
CREATE PROCEDURE sea_UpdateHeart(IN p_id INT, IN p_heart TINYINT)
	BEGIN
		UPDATE sea_user_info SET heart = p_heart WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateLastChargeTime $$
CREATE PROCEDURE sea_UpdateLastChargeTime(IN p_id INT, IN p_updated_charged_time BIGINT)
	BEGIN
		UPDATE sea_user_info SET last_charged_time = p_updated_charged_time WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateSelectedCharacter $$
CREATE PROCEDURE sea_UpdateSelectedCharacter(IN p_id INT, IN p_selected SMALLINT)
	BEGIN
		UPDATE sea_user_info SET selected_character = p_selected WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateSelectedAssistant $$
CREATE PROCEDURE sea_UpdateSelectedAssistant(IN p_id INT, IN p_selected SMALLINT)
	BEGIN
		UPDATE sea_user_info SET selected_assistant = p_selected WHERE id = p_id;
	END
$$

DELIMITER ;
