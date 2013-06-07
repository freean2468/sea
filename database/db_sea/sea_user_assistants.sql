USE sea;

########################
##
########################
DROP TABLE IF EXISTS sea_user_assistants;

CREATE TABLE sea.sea_user_assistants(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	assistants SMALLINT NOT NULL,
	basic_assist_lv TINYINT NOT NULL,

	INDEX idx_user_assistants_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$
DROP PROCEDURE IF EXISTS sea_AddUserAssistant $$
CREATE PROCEDURE sea_AddUserAssistant(IN p_id INT, IN p_assistant SMALLINT)
	BEGIN
		UPDATE sea_user_assistants SET assistants = assistants | p_assistant WHERE id = p_id;
	END
$$

DELIMITER ;
