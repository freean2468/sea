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

DROP PROCEDURE IF EXISTS sea_AddCharacter_4 $$
CREATE PROCEDURE sea_AddCharacter_4(IN p_id INT)
	BEGIN
		DECLARE res TINYINT UNSIGNED;
		UPDATE sea_character_4 SET res = lv + 1, lv = lv + 1 WHERE id = p_id;
		SELECT res AS res;
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
