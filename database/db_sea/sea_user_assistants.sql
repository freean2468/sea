USE sea;

########################
##
########################
DROP TABLE IF EXISTS sea_user_assistants;

CREATE TABLE sea.sea_user_assistants(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	assistant_one TINYINT NOT NULL,
	assistant_two TINYINT NOT NULL,
	assistant_three TINYINT NOT NULL,
	assistant_four TINYINT NOT NULL,
	assistant_five TINYINT NOT NULL,
	assistant_six TINYINT NOT NULL,
	assistant_seven TINYINT NOT NULL,
	assistant_eight TINYINT NOT NULL,
	assistant_nine TINYINT NOT NULL,
	assistant_ten TINYINT NOT NULL,

	INDEX idx_user_assistants_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_AddAssistantOne $$
CREATE PROCEDURE sea_AddAssistantOne(IN p_id INT)
	BEGIN
		UPDATE sea_user_assistants SET assistant_one = assistant_one + 1 WHERE id = p_id;
		SELECT assistant_one AS res FROM sea_user_assistants WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddAssistantTwo $$
CREATE PROCEDURE sea_AddAssistantTwo(IN p_id INT)
	BEGIN
		UPDATE sea_user_assistants SET assistant_two = assistant_two + 1 WHERE id = p_id;
		SELECT assistant_two AS res FROM sea_user_assistants WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddAssistantThree $$
CREATE PROCEDURE sea_AddAssistantThree(IN p_id INT)
	BEGIN
		UPDATE sea_user_assistants SET assistant_three = assistant_three + 1 WHERE id = p_id;
		SELECT assistant_three AS res FROM sea_user_assistants WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddAssistantFour $$
CREATE PROCEDURE sea_AddAssistantFour(IN p_id INT)
	BEGIN
		UPDATE sea_user_assistants SET assistant_four = assistant_four + 1 WHERE id = p_id;
		SELECT assistant_four AS res FROM sea_user_assistants WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddAssistantFive $$
CREATE PROCEDURE sea_AddAssistantFive(IN p_id INT)
	BEGIN
		UPDATE sea_user_assistants SET assistant_five = assistant_five + 1 WHERE id = p_id;
		SELECT assistant_five AS res FROM sea_user_assistants WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddAssistantSix $$
CREATE PROCEDURE sea_AddAssistantSix(IN p_id INT)
	BEGIN
		UPDATE sea_user_assistants SET assistant_six = assistant_six + 1 WHERE id = p_id;
		SELECT assistant_six AS res FROM sea_user_assistants WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddAssistantSeven $$
CREATE PROCEDURE sea_AddAssistantSeven(IN p_id INT)
	BEGIN
		UPDATE sea_user_assistants SET assistant_seven = assistant_seven + 1 WHERE id = p_id;
		SELECT assistant_seven AS res FROM sea_user_assistants WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddAssistantEight $$
CREATE PROCEDURE sea_AddAssistantEight(IN p_id INT)
	BEGIN
		UPDATE sea_user_assistants SET assistant_eight = assistant_eight + 1 WHERE id = p_id;
		SELECT assistant_eight AS res FROM sea_user_assistants WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddAssistantNine $$
CREATE PROCEDURE sea_AddAssistantNine(IN p_id INT)
	BEGIN
		UPDATE sea_user_assistants SET assistant_nine = assistant_nine + 1 WHERE id = p_id;
		SELECT assistant_nine AS res FROM sea_user_assistants WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddAssistantTen $$
CREATE PROCEDURE sea_AddAssistantTen(IN p_id INT)
	BEGIN
		UPDATE sea_user_assistants SET assistant_ten = assistant_ten + 1 WHERE id = p_id;
		SELECT assistant_ten AS res FROM sea_user_assistants WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_SelectUserAssistant $$
CREATE PROCEDURE sea_SelectUserAssistant(IN p_id INT)
	BEGIN
		SELECT assistant_one, assistant_two, assistant_three, assistant_four, assistant_five, assistant_six, assistant_seven, assistant_eight, assistant_nine, assistant_ten AS res FROM sea.sea_user_assistants WHERE id = p_id;
	END
$$

DELIMITER ;
