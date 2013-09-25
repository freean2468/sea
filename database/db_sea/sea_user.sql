USE sea;

SET foreign_key_checks = 0;

DROP TABLE IF EXISTS sea_user;

SET foreign_key_checks = 1;

CREATE TABLE sea.sea_user(
	id INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
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
		DECLARE last_id INT UNSIGNED;
		DECLARE isExist INT UNSIGNED;

		SELECT count(*) INTO isExist FROM sea_user WHERE k_id = p_k_id;

		IF isExist = 0 THEN
			INSERT sea_user(k_id) VALUES (p_k_id);
			SET last_id = LAST_INSERT_ID();

			INSERT sea_user_info(coin, mineral, lv, exp, point, energy, last_charged_time, 
									selected_character, invite_count, mileage, draw)
			VALUES (99999, 9999, 1, 0, 0, 9999, UNIX_TIMESTAMP(NOW()), 
					1, 0, 0, 0);

			INSERT sea_user_characters(character_one, character_two, character_three, character_four)
			VALUES (1, 0, 0, 0);

			INSERT sea_user_items(shield, item_last, ghost, weapon_reinforce, exp_boost, max_attack, bonus_heart, drop_up, magnet, bonus_score)
			VALUES (0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

			INSERT sea_user_log(total_score, highest_score, last_dist, total_dist, total_kill, play_time)
			VALUES (0, 0, 0, 0, 0, 0);

			INSERT sea_user_metric(uv, last_week_uv, this_week_uv, pu)
			VALUES (1, 0, 1, 0);

			INSERT sea_user_upgrade(bonus_score, bonus_time, cooldown)
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
CREATE PROCEDURE sea_LoadUserKId(IN p_id INT UNSIGNED) 
	BEGIN
		SELECT k_id AS res FROM sea_user WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_DeleteUser $$
CREATE PROCEDURE sea_DeleteUser(IN p_id INT UNSIGNED)
	BEGIN
		DECLARE k_id_copy varchar(40);

		SELECT k_id INTO k_id_copy FROM sea_user WHERE id = p_id;

		DELETE FROM sea_user_black WHERE k_id = k_id_copy;

		DELETE FROM sea_user_info WHERE id = p_id;
		DELETE FROM sea_user_characters WHERE id = p_id;
		DELETE FROM sea_user_items WHERE id = p_id;
		DELETE FROM sea_user_log WHERE id = p_id;
		DELETE FROM sea_user_metric WHERE id = p_id;
		DELETE FROM sea_user_upgrade WHERE id = p_id;
--		DELETE FROM sea_user_energy WHERE id = p_id;
--		DELETE FROM sea_user_baton WHERE id = p_id;
--		DELETE FROM sea_user_baton_result WHERE id = p_id;

		DELETE FROM sea_user WHERE id = p_id;
	END
$$

DELIMITER ;
