USE sea;

SET foreign_key_checks = 0;

DROP TABLE IF EXISTS sea_user;

SET foreign_key_checks = 1;

CREATE TABLE sea.sea_user(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	k_id VARCHAR(40) NOT NULL,

	INDEX idx_user_1 (id),
	INDEX idx_user_2 (k_id)
);

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_GetUserCount$$
CREATE PROCEDURE sea_GetUserCount()
	BEGIN
		SELECT COUNT(ID) FROM sea_user;
	END
$$

DROP PROCEDURE IF EXISTS sea_CreateUser$$
CREATE PROCEDURE sea_CreateUser(IN p_k_id varchar(40) CHARACTER SET utf8)
	BEGIN
		DECLARE last_id INT;
		DECLARE isExist INT;

		SELECT count(*) INTO isExist FROM sea_user WHERE k_id = p_k_id;

		IF isExist = 0 THEN
			INSERT sea_user(k_id) VALUES (p_k_id);
			SET last_id = LAST_INSERT_ID();

			INSERT sea_user_info(coin, mineral, lv, exp, point, honey, last_charged_time, 
									selected_character, selected_assistant, invite_count, mileage, draw)
			VALUES (99999, 9999, 1, 0, 0, 9999, UNIX_TIMESTAMP(NOW()), 
					1, 0, 0, 0, 0);

			INSERT sea_user_characters(character_one, character_two, character_three, character_four, character_five, character_six, character_seven, character_eight, character_nine, character_ten)
			VALUES (1, 0, 0, 0, 0, 0, 0, 0, 0, 0);

			INSERT sea_user_assistants(assistant_one, assistant_two, assistant_three, assistant_four, assistant_five, assistant_six, assistant_seven, assistant_eight, assistant_nine, assistant_ten)
			VALUES (0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

			INSERT sea_user_items(exp_boost, item_last, max_attack, random)
			VALUES (0, 0, 0, 0);

			INSERT sea_user_log(total_score, highest_score, last_dist, total_dist, total_kill, play_time)
			VALUES (0, 0, 0, 0, 0, 0);

			INSERT sea_user_metric(uv, last_week_uv, this_week_uv, pu)
			VALUES (1, 0, 1, 0);

			INSERT sea_user_upgrade(honey_score, honey_time, cooldown)
			VALUES (0, 0, 0);

			SELECT last_id AS res;			
		ELSE
			SELECT 0 AS res;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadUser $$
CREATE PROCEDURE sea_LoadUser(IN p_k_id varchar(40) CHARACTER SET utf8) 
	BEGIN
		DECLARE isExist TINYINT;

		SELECT count(*) INTO isExist FROM sea_user WHERE k_id = p_k_id;

		IF isExist > 0 THEN
			SELECT id AS res FROM sea_user WHERE k_id = p_k_id;
		ELSE
			SELECT 0 AS res;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadUserKId $$
CREATE PROCEDURE sea_LoadUserKId(IN p_id INT) 
	BEGIN
		SELECT k_id AS res FROM sea_user WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_DeleteUser $$
CREATE PROCEDURE sea_DeleteUser(IN p_id INT)
	BEGIN
		DECLARE k_id_copy varchar(40);

		SELECT k_id INTO k_id_copy FROM sea_user WHERE id = p_id;

		DELETE FROM sea_user_black WHERE k_id = k_id_copy;

		DELETE FROM sea_user_info WHERE id = p_id;
		DELETE FROM sea_user_characters WHERE id = p_id;
		DELETE FROM sea_user_assistants WHERE id = p_id;
		DELETE FROM sea_user_items WHERE id = p_id;
		DELETE FROM sea_user_log WHERE id = p_id;
		DELETE FROM sea_user_metric WHERE id = p_id;
		DELETE FROM sea_user_upgrade WHERE id = p_id;

		DELETE FROM sea_user WHERE id = p_id;
	END
$$

DELIMITER ;
