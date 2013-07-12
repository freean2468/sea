USE sea;

########################
##
########################
DROP TABLE IF EXISTS sea_user_characters;

CREATE TABLE sea.sea_user_characters(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	characters SMALLINT NOT NULL,
	basic_charac_lv TINYINT NOT NULL,

	INDEX idx_user_characters_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_AddUserCharacter $$
CREATE PROCEDURE sea_AddUserCharacter(IN p_id INT, IN p_character SMALLINT)
	BEGIN
		UPDATE sea_user_characters SET characters = characters | p_character  WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_IsUserCharacter $$
CREATE PROCEDURE sea_IsUserCharacter(IN p_id INT)
	BEGIN
		SELECT characters AS res FROM sea_user_characters WHERE id = p_id;
	END
$$

DELIMITER ;
