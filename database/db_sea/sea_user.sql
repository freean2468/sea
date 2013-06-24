USE sea;

DROP TABLE IF EXISTS sea_user;

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
CREATE PROCEDURE sea_CreateUser(IN p_k_id varchar(40) CHARACTER SET utf8, IN p_time BIGINT)
	BEGIN
		DECLARE last_id INT;
		DECLARE isExist INT;

		SELECT count(*) INTO isExist FROM sea_user WHERE k_id = p_k_id;

		IF isExist = 0 THEN
			INSERT sea_user(k_id) VALUES (p_k_id);
			SET last_id = LAST_INSERT_ID();

			INSERT sea_user_info(coin, mineral, lv, exp, point, heart, last_charged_time, 
								selected_character, selected_assistant)
			VALUES (99999, 9999, 1, 0, 0, 99, p_time, 1, 1);

			INSERT sea_user_characters(characters, basic_charac_lv)
			VALUES (1, 1);

			INSERT sea_user_assistants(assistants, basic_assist_lv)
			VALUES (1, 1);

			INSERT sea_user_items(items, count)
			VALUES (1, 1);

			INSERT sea_user_log(total_score, highest_score, last_dist, total_dist, total_kill, play_time)
			VALUES (0, 0, 0, 0, 0, 0);

			INSERT sea_user_metric(uv, last_week_uv, this_week_uv, pu)
			VALUES (1, 0, 1, 0);

			SELECT last_id;			
		ELSE
			SELECT 0;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadUser $$
CREATE PROCEDURE sea_LoadUser(IN p_k_id varchar(40) CHARACTER SET utf8) 
	BEGIN
		DECLARE isExist INT;

		SELECT count(*) INTO isExist FROM sea_user WHERE k_id = p_k_id;

		IF isExist > 0 THEN
			SELECT id FROM sea_user WHERE k_id = p_k_id;
		ELSE
			SELECT 0;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_DeleteUser $$
CREATE PROCEDURE sea_DeleteUser(IN p_id INT)
	BEGIN
		DELETE FROM sea_user WHERE id = p_id;
		DELETE FROM sea_user_info WHERE id = p_id;
		DELETE FROM sea_user_characters WHERE id = p_id;
		DELETE FROM sea_user_assistants WHERE id = p_id;
		DELETE FROM sea_items WHERE id = p_id;
	END
$$

DELIMITER ;
