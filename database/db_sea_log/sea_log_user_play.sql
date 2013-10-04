USE sea_log;

DROP TABLE IF EXISTS sea_user_play;

CREATE TABLE sea_log.sea_user_play(
	id BIGINT NOT NULL AUTO_INCREMENT,
	k_id VARCHAR(40) NOT NULL,
	w_date DATE NOT NULL,
	w_time TIME NOT NULL,
	selected_character SMALLINT NOT NULL,
	score INT NOT NULL,
	enemy_kill INT NOT NULL,
	dist INT NOT NULL,
	play_time INT NOT NULL,
	exp_boost INT NOT NULL,
	item_last INT NOT NULL,
	shield INT NOT NULL,
	ghostify INT NOT NULL,
	immortal INT NOT NULL,
	random INT NOT NULL,
	PRIMARY KEY (id, w_date)
)ENGINE=MyISAM
PARTITION BY RANGE COLUMNS (w_date) (
	PARTITION p201308 VALUES LESS THAN ('2013-09-01'),
	PARTITION p201309 VALUES LESS THAN ('2013-10-01'),
	PARTITION p201310 VALUES LESS THAN ('2013-11-01'),
	PARTITION p201311 VALUES LESS THAN ('2013-12-01'),
	PARTITION p201312 VALUES LESS THAN ('2014-01-01'),
	PARTITION pMAX VALUES LESS THAN (MAXVALUE)
);

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_AddLogPlay $$
CREATE PROCEDURE sea_AddLogPlay(IN p_k_id VARCHAR (40) CHARACTER SET utf8, IN p_selected_character SMALLINT,
								IN p_score INT, IN p_enemy_kill INT, IN p_dist INT, IN p_play_time INT, 
								IN p_exp_boost INT, IN p_item_last INT,	IN p_shield INT, IN p_ghostify INT, 
								IN p_immortal INT, IN p_random INT)
	BEGIN
		INSERT sea_user_play(k_id, w_date, w_time, selected_character, score, enemy_kill, dist, play_time, 
								exp_boost, item_last, shield, ghostify, immortal, random)
		VALUES (p_k_id, CURDATE(), CURTIME(), p_selected_character, p_score, p_enemy_kill, p_dist, 
				p_play_time, p_exp_boost, p_item_last, p_shield, p_ghostify, p_immortal, p_random);

		SELECT LAST_INSERT_ID() AS res;
	END
$$

DELIMITER ;
