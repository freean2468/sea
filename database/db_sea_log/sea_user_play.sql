USE sea_log;

DROP TABLE IF EXISTS sea_user_play;

CREATE TABLE sea_log.sea_user_play(
	id BIGINT NOT NULL AUTO_INCREMENT,
	k_id VARCHAR(40) NOT NULL,
	w_date DATE NOT NULL,
	w_time TIME NOT NULL,
	selected_character SMALLINT NOT NULL,
	selected_assistant SMALLINT NOT NULL,
	score INT NOT NULL,
	enemy_kill INT NOT NULL,
	dist INT NOT NULL,
	play_time INT NOT NULL,
	PRIMARY KEY (id, w_date)
)ENGINE=ARCHIVE
PARTITION BY RANGE (to_days(w_date)) (
	PARTITION p201306 VALUES LESS THAN (to_days('2013-07-01')),
	PARTITION p201307 VALUES LESS THAN (to_days('2013-08-01')),
	PARTITION p201308 VALUES LESS THAN (to_days('2013-09-01')),
	PARTITION p201309 VALUES LESS THAN (to_days('2013-10-01')),
	PARTITION p201310 VALUES LESS THAN (to_days('2013-11-01')),
	PARTITION p201311 VALUES LESS THAN (to_days('2013-12-01')),
	PARTITION p201312 VALUES LESS THAN (to_days('2014-01-01'))
);

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_AddLogPlay $$
CREATE PROCEDURE sea_AddLogPlay(IN p_k_id VARCHAR (40) CHARACTER SET utf8, IN p_selected_character SMALLINT, IN p_selected_assistant SMALLINT,
								IN p_score INT, IN p_enemy_kill INT, IN p_dist INT, IN p_play_time INT)
	BEGIN
		INSERT sea_user_play(k_id, w_date, w_time, selected_character, selected_assistant, score, enemy_kill, dist, play_time)
		VALUES (p_k_id, CURDATE(), CURTIME(), p_selected_character, p_selected_assistant, p_score, p_enemy_kill, p_dist, p_play_time);

		SELECT LAST_INSERT_ID();
	END
$$

DELIMITER ;
