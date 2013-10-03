USE sea;

DROP TABLE IF EXISTS sea_character_3;

CREATE TABLE sea.sea_character_3(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	lv TINYINT UNSIGNED NOT NULL,
	exp INT UNSIGNED NOT NULL,
	head TINYINT UNSIGNED NOT NULL,
	top TINYINT UNSIGNED NOT NULL,
	bottoms TINYINT UNSIGNED NOT NULL,
	back TINYINT UNSIGNED NOT NULL,

	INDEX idx_character_3 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadCharacter_3 $$
CREATE PROCEDURE sea_LoadCharacter_3(IN p_id INT)
	BEGIN
		SELECT lv, exp FROM sea_character_3 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacter_3 $$
CREATE PROCEDURE sea_AddCharacter_3(IN p_id INT)
	BEGIN
		DECLARE res TINYINT UNSIGNED;
		UPDATE sea_character_3 SET res = lv + 1, lv = lv + 1 WHERE id = p_id;
		SELECT res AS res;
	END
$$

DROP PROCEDURE IF EXISTS sea_SelectCharacter_3_Costumes $$
CREATE PROCEDURE sea_SelectCharacter_3_Costumes(IN p_id INT)
	BEGIN
		SELECT head, top, bottoms, back FROM sea_character_3 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_3_Head $$
CREATE PROCEDURE sea_UpdateCharacter_3_Head(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_3 SET head = p_costume WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_3_Top $$
CREATE PROCEDURE sea_UpdateCharacter_3_Top(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_3 SET top = p_costume WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_3_Bottoms $$
CREATE PROCEDURE sea_UpdateCharacter_3_Bottoms(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_3 SET bottoms = p_costume WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_3_Back $$
CREATE PROCEDURE sea_UpdateCharacter_3_Back(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_3 SET back = p_costume WHERE id = p_id;
	END
$$

DELIMITER ;
