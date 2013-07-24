USE sea;

DROP TABLE IF EXISTS sea_user_characters;

CREATE TABLE sea.sea_user_characters(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	character_one TINYINT NOT NULL,
	character_two TINYINT NOT NULL,
	character_three TINYINT NOT NULL,
	character_four TINYINT NOT NULL,
	character_five TINYINT NOT NULL,
	character_six TINYINT NOT NULL,
	character_seven TINYINT NOT NULL,
	character_eight TINYINT NOT NULL,
	character_nine TINYINT NOT NULL,
	character_ten TINYINT NOT NULL,

	INDEX idx_user_characters_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_AddCharacterOne $$
CREATE PROCEDURE sea_AddCharacterOne(IN p_id INT)
	BEGIN
		UPDATE sea_user_characters SET character_one = character_one + 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacterTwo $$
CREATE PROCEDURE sea_AddCharacterTwo(IN p_id INT)
	BEGIN
		UPDATE sea_user_characters SET character_two = character_two + 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacterThree $$
CREATE PROCEDURE sea_AddCharacterThree(IN p_id INT)
	BEGIN
		UPDATE sea_user_characters SET character_three = character_three + 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacterFour $$
CREATE PROCEDURE sea_AddCharacterFour(IN p_id INT)
	BEGIN
		UPDATE sea_user_characters SET character_four = character_four + 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacterFive $$
CREATE PROCEDURE sea_AddCharacterFive(IN p_id INT)
	BEGIN
		UPDATE sea_user_characters SET character_five = character_five + 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacterSix $$
CREATE PROCEDURE sea_AddCharacterSix(IN p_id INT)
	BEGIN
		UPDATE sea_user_characters SET character_six = character_six + 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacterSeven $$
CREATE PROCEDURE sea_AddCharacterSeven(IN p_id INT)
	BEGIN
		UPDATE sea_user_characters SET character_seven = character_seven + 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacterEight $$
CREATE PROCEDURE sea_AddCharacterEight(IN p_id INT)
	BEGIN
		UPDATE sea_user_characters SET character_eight = character_eight + 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacterNine $$
CREATE PROCEDURE sea_AddCharacterNine(IN p_id INT)
	BEGIN
		UPDATE sea_user_characters SET character_nine = character_nine + 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCharacterTen $$
CREATE PROCEDURE sea_AddCharacterTen(IN p_id INT)
	BEGIN
		UPDATE sea_user_characters SET character_ten = character_ten + 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_SelectUserCharacter $$
CREATE PROCEDURE sea_SelectUserCharacter(IN p_id INT)
	BEGIN
		SELECT character_one, character_two, character_three, character_four, character_five, character_six, character_seven, character_eight, character_nine, character_ten FROM sea_user_characters WHERE id = p_id;
	END
$$

DELIMITER ;
