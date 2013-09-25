USE sea;

DROP TABLE IF EXISTS sea_user_characters;

CREATE TABLE sea.sea_user_characters(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	character_one TINYINT UNSIGNED NOT NULL,
	character_two TINYINT UNSIGNED NOT NULL,
	character_three TINYINT UNSIGNED NOT NULL,
	character_four TINYINT UNSIGNED NOT NULL,

	INDEX idx_user_characters_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_AddCharacterOne $$
CREATE PROCEDURE sea_AddCharacterOne(IN p_id INT)
	BEGIN
		DECLARE res TINYINT UNSIGNED;

		UPDATE sea_user_characters SET res = character_one + 1, character_one = character_one + 1 WHERE id = p_id;
		SELECT res AS res;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacterTwo $$
CREATE PROCEDURE sea_AddCharacterTwo(IN p_id INT)
	BEGIN
		UPDATE sea_user_characters SET character_two = character_two + 1 WHERE id = p_id;
		SELECT character_two AS res FROM sea_user_characters where id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacterThree $$
CREATE PROCEDURE sea_AddCharacterThree(IN p_id INT)
	BEGIN
		UPDATE sea_user_characters SET character_three = character_three + 1 WHERE id = p_id;
		SELECT character_three AS res FROM sea_user_characters where id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacterFour $$
CREATE PROCEDURE sea_AddCharacterFour(IN p_id INT)
	BEGIN
		UPDATE sea_user_characters SET character_four = character_four + 1 WHERE id = p_id;
		SELECT character_four AS res FROM sea_user_characters where id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_SelectUserCharacter $$
CREATE PROCEDURE sea_SelectUserCharacter(IN p_id INT)
	BEGIN
		SELECT character_one, character_two, character_three, character_four FROM sea_user_characters WHERE id = p_id;
	END
$$

DELIMITER ;
