USE sea;

DROP TABLE IF EXISTS sea_character_2;

CREATE TABLE sea.sea_character_2(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	lv TINYINT UNSIGNED NOT NULL,
	head TINYINT UNSIGNED NOT NULL,
	top TINYINT UNSIGNED NOT NULL,
	bottoms TINYINT UNSIGNED NOT NULL,
	back TINYINT UNSIGNED NOT NULL,

	INDEX idx_character_2 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadCharacter_2 $$
CREATE PROCEDURE sea_LoadCharacter_2(IN p_id INT)
	BEGIN
		SELECT lv FROM sea_character_2 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacter_2 $$
CREATE PROCEDURE sea_AddCharacter_2(IN p_id INT)
	BEGIN
		UPDATE sea_character_2 SET lv = lv + 1 WHERE id = p_id;
		SELECT lv FROM sea_character_2 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_CreateCharacter_2_BasicCostumes $$
CREATE PROCEDURE sea_CreateCharacter_2_BasicCostumes(IN p_id INT)
	BEGIN
		CALL sea.sea_OnCostume_5(p_id);
		CALL sea.sea_OnCostume_6(p_id);
		CALL sea.sea_OnCostume_24(p_id);
		CALL sea.sea_UpdateCharacter_2_Top(p_id, 5);
		CALL sea.sea_UpdateCharacter_2_Bottoms(p_id, 6);
		CALL sea.sea_UpdateCharacter_2_Head(p_id, 24);
	END
$$

DROP PROCEDURE IF EXISTS sea_SelectCharacter_2_Costumes $$
CREATE PROCEDURE sea_SelectCharacter_2_Costumes(IN p_id INT)
	BEGIN
		SELECT head, top, bottoms, back FROM sea_character_2 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_2_Head $$
CREATE PROCEDURE sea_UpdateCharacter_2_Head(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_2 SET head = p_costume WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_2_Top $$
CREATE PROCEDURE sea_UpdateCharacter_2_Top(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_2 SET top = p_costume WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_2_Bottoms $$
CREATE PROCEDURE sea_UpdateCharacter_2_Bottoms(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_2 SET bottoms = p_costume WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_2_Back $$
CREATE PROCEDURE sea_UpdateCharacter_2_Back(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_2 SET back = p_costume WHERE id = p_id;
	END
$$

DELIMITER ;
