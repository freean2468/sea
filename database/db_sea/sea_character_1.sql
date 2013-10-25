USE sea;

DROP TABLE IF EXISTS sea_character_1;

CREATE TABLE sea.sea_character_1 (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	lv TINYINT UNSIGNED NOT NULL,
	head TINYINT UNSIGNED NOT NULL,
	top TINYINT UNSIGNED NOT NULL,
	bottoms TINYINT UNSIGNED NOT NULL,
	back TINYINT UNSIGNED NOT NULL,

	INDEX idx_character_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadCharacter_1 $$
CREATE PROCEDURE sea_LoadCharacter_1(IN p_id INT)
	BEGIN
		SELECT lv FROM sea_character_1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_SelectCharacters $$
CREATE PROCEDURE sea_SelectCharacters(IN p_id INT)
	BEGIN
		SELECT _1.lv AS _1, _2.lv AS _2, _3.lv AS _3, _4.lv AS _4 
		FROM sea_character_1 AS _1
		INNER JOIN sea.sea_character_2 AS _2 ON p_id = _2.id
		INNER JOIN sea.sea_character_3 AS _3 ON p_id = _3.id
		INNER JOIN sea.sea_character_4 AS _4 ON p_id = _4.id
		WHERE _1.id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacter_1 $$
CREATE PROCEDURE sea_AddCharacter_1(IN p_id INT)
	BEGIN
		DECLARE res TINYINT UNSIGNED;
		UPDATE sea_character_1 SET res = lv + 1, lv = lv + 1 WHERE id = p_id;
		SELECT res;
	END
$$

DROP PROCEDURE IF EXISTS sea_SelectCharacter_1_Costumes $$
CREATE PROCEDURE sea_SelectCharacter_1_Costumes(IN p_id INT)
	BEGIN
		SELECT head, top, bottoms, back FROM sea_character_1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_1_Head $$
CREATE PROCEDURE sea_UpdateCharacter_1_Head(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_1 SET head = p_costume WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_1_Top $$
CREATE PROCEDURE sea_UpdateCharacter_1_Top(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_1 SET top = p_costume WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_1_Bottoms $$
CREATE PROCEDURE sea_UpdateCharacter_1_Bottoms(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_1 SET bottoms = p_costume WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCharacter_1_Back $$
CREATE PROCEDURE sea_UpdateCharacter_1_Back(IN p_id INT, IN p_costume INT)
	BEGIN
		UPDATE sea_character_1 SET back = p_costume WHERE id = p_id;
	END
$$

DELIMITER ;
