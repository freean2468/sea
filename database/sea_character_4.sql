USE sea;

DROP TABLE IF EXISTS sea_character_4;

CREATE TABLE sea.sea_character_4(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	lv TINYINT UNSIGNED NOT NULL,
	head TINYINT UNSIGNED NOT NULL,
	top TINYINT UNSIGNED NOT NULL,
	bottoms TINYINT UNSIGNED NOT NULL,
	back TINYINT UNSIGNED NOT NULL,

	INDEX idx_character_4 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadCharacter_4 $$
CREATE PROCEDURE sea_LoadCharacter_4(IN p_id INT)
	BEGIN
		SELECT lv FROM sea_character_4 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacter_4 $$
CREATE PROCEDURE sea_AddCharacter_4(IN p_id INT)
	BEGIN
		UPDATE sea_character_4 SET lv = lv + 1 WHERE id = p_id;
		SELECT lv FROM sea_character_4 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_CreateCharacter_4_BasicCostumes $$
CREATE PROCEDURE sea_CreateCharacter_4_BasicCostumes(IN p_id INT)
	BEGIN
		CALL sea.sea_OnCostume_7(p_id);
		CALL sea.sea_OnCostume_8(p_id);
		CALL sea.sea_OnCostume_25(p_id);
		CALL sea.sea_UpdateCharacter_4_Top(p_id, 7);
		CALL sea.sea_UpdateCharacter_4_Bottoms(p_id, 8);
		CALL sea.sea_UpdateCharacter_4_Head(p_id, 25);
	END
$$

DROP PROCEDURE IF EXISTS sea_SelectCharacter_4_Costumes $$
CREATE PROCEDURE sea_SelectCharacter_4_Costumes(IN p_id INT)
	BEGIN
		SELECT head, top, bottoms, back FROM sea_character_4 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_4_Head $$
CREATE PROCEDURE sea_UpdateCharacter_4_Head(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_4 SET head = p_costume WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_4_Top $$
CREATE PROCEDURE sea_UpdateCharacter_4_Top(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_4 SET top = p_costume WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_4_Bottoms $$
CREATE PROCEDURE sea_UpdateCharacter_4_Bottoms(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_4 SET bottoms = p_costume WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_4_Back $$
CREATE PROCEDURE sea_UpdateCharacter_4_Back(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_4 SET back = p_costume WHERE id = p_id;
	END
$$

DELIMITER ;
