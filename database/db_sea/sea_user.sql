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

DROP PROCEDURE IF EXISTS sea_GetUserCount $$
CREATE PROCEDURE sea_GetUserCount()
	BEGIN
		SELECT COUNT(ID) AS res FROM sea_user;
	END
$$

DROP PROCEDURE IF EXISTS sea_CreateUser $$
CREATE PROCEDURE sea_CreateUser(IN p_k_id varchar(40) CHARACTER SET utf8)
	BEGIN
		DECLARE last_id INT;
		DECLARE isExist INT UNSIGNED;

		SELECT count(*) INTO isExist FROM sea_user WHERE k_id = p_k_id;

		IF isExist = 0 THEN
			INSERT sea_user(k_id) VALUES (p_k_id);
			SET last_id = LAST_INSERT_ID();

			INSERT sea_user_info(lv, exp, coin, cash, energy, last_charged_time, 
									selected_character, invite_count, mileage, draw)
			VALUES (1, 0, 99999, 9999, 100, UNIX_TIMESTAMP(NOW()), 
					3, 0, 0, 0);

			INSERT sea_item(_1, _2, _3, _4, _5, random)
			VALUES (0, 0, 0, 0, 0, 0);

			INSERT sea_user_log(total_score, highest_score, last_dist, total_dist, total_kill, play_time)
			VALUES (0, 0, 0, 0, 0, 0);

			INSERT sea_metric(uv, last_week_uv, this_week_uv, pu)
			VALUES (1, 0, 1, 0);

			INSERT sea_character_1(lv, head, top, bottoms, back)
			VALUES (0, 0, 0, 0, 0);

			INSERT sea_character_2(lv, head, top, bottoms, back)
			VALUES (0, 0, 0, 0, 0);

			INSERT sea_character_3(lv, head, top, bottoms, back)
			VALUES (1, 22, 1, 2, 0);

			INSERT sea_character_4(lv, head, top, bottoms, back)
			VALUES (0, 0, 0, 0, 0);

			INSERT sea_costume_1(_1, _2, _3, _4, _5, _6, _7, _8, _9, _10)
			VALUES (1, 1, 0, 0, 0, 0, 0, 0, 0, 0);

			INSERT sea_costume_2(_11, _12, _13, _14, _15, _16, _17, _18, _19, _20)
			VALUES (0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

			INSERT sea_costume_3(_21, _22, _23, _24, _25, _26, _27, _28, _29, _30)
			VALUES (0, 1, 0, 0, 0, 0, 0, 0, 0, 0);

			INSERT sea_ghost_house(_1, _2, _3, _4, _5, _1_time, _2_time, _3_time, _4_time, _5_time)
			VALUES (0, -1, -1, -1, -1, 0, 0, 0, 0, 0);

			INSERT sea_ghost_1(_1, _2, _3, _4, _5, _6, _7, _8, _9, _10)
			VALUES (0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

			INSERT sea_ghost_2(_11, _12, _13, _14, _15, _16, _17, _18, _19, _20)
			VALUES (0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

			INSERT sea_ghost_3(_21, _22, _23, _24, _25, _26, _27, _28, _29, _30)
			VALUES (0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

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
		DELETE FROM sea_character_1 WHERE id = p_id;
		DELETE FROM sea_character_2 WHERE id = p_id;
		DELETE FROM sea_character_3 WHERE id = p_id;
		DELETE FROM sea_character_4 WHERE id = p_id;
		DELETE FROM sea_item WHERE id = p_id;
		DELETE FROM sea_user_log WHERE id = p_id;
		DELETE FROM sea_metric WHERE id = p_id;
		DELETE FROM sea_ghost_1 WHERE id = p_id;
		DELETE FROM sea_ghost_2 WHERE id = p_id;
		DELETE FROM sea_ghost_house WHERE id = p_id;
		DELETE FROM sea_costume_head_1 WHERE id = p_id;
		DELETE FROM sea_costume_top_1 WHERE id = p_id;
		DELETE FROM sea_costume_bottoms_1 WHERE id = p_id;
		DELETE FROM sea_costume_back_1 WHERE id = p_id;
--		DELETE FROM sea_user_energy WHERE id = p_id;
--		DELETE FROM sea_baton WHERE id = p_id;
--		DELETE FROM sea_baton_result WHERE id = p_id;

		DELETE FROM sea_user WHERE id = p_id;
	END
$$

DELIMITER ;
