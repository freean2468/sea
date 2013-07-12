USE sea;

DROP TABLE IF EXISTS sea_user_log;

CREATE TABLE sea.sea_user_log(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	total_score BIGINT NOT NULL,
	highest_score INT NOT NULL,
	last_dist INT NOT NULL,
	total_dist BIGINT NOT NULL,
	total_kill INT NOT NULL,
	play_time INT NOT NULL,

	INDEX idx_user_log_1 (id)
);

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadHighestScore $$
CREATE PROCEDURE sea_LoadHighestScore(IN p_id INT)
	BEGIN
		SELECT highest_score AS res FROM sea.sea_user_log WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateUserLog $$
CREATE PROCEDURE sea_UpdateUserLog(IN p_id INT, IN p_score INT, IN p_dist INT, IN p_kill INT)
	BEGIN
		DECLARE highest INT;
		SELECT highest_score INTO highest FROM sea.sea_user_log WHERE id = p_id;

		IF highest < p_score THEN
			SET highest = p_score;
		END IF;

		UPDATE sea.sea_user_log 
		SET total_score = total_score + p_score, highest_score = highest, 
			last_dist = p_dist, total_dist = total_dist + p_dist, total_kill = total_kill + p_kill, play_time = play_time + 1
		WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_Ranking $$
CREATE PROCEDURE sea_Ranking()
	BEGIN
		SELECT U.k_id, L.highest_score
		FROM sea.sea_user_log AS L
		INNER JOIN sea.sea_user AS U ON U.id = L.id;
	END
$$

DELIMITER ;
