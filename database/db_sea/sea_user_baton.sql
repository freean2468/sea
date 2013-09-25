USE sea;

DROP TABLE IF EXISTS sea_user_baton;

CREATE TABLE sea.sea_user_baton (
	sender_id INT NOT NULL,
	receiver_id INT NOT NULL,
	score INT UNSIGNED NOT NULL,
	map VARCHAR(10) NOT NULL,
	sended_time BIGINT UNSIGNED NOT NULL,

	PRIMARY KEY(sender_id, receiver_id, sended_time),
	FOREIGN KEY(sender_id) REFERENCES sea_user(id) ON DELETE CASCADE ON UPDATE RESTRICT,
	FOREIGN KEY(receiver_id) REFERENCES sea_user(id) ON DELETE CASCADE ON UPDATE RESTRICT,

	INDEX idx_user_baton_1(sender_id, receiver_id),
	INDEX idx_user_baton_2(sended_time)
);

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_AddBaton $$
CREATE PROCEDURE sea_AddBaton(IN p_sender_id INT, IN p_receiver_id INT, IN p_score INT UNSIGNED, IN p_map VARCHAR(10) CHARACTER SET utf8)
	BEGIN
		INSERT sea_user_baton(sender_id, receiver_id, score, map, sended_time)
		VALUES (p_sender_id, p_receiver_id, p_score, p_map, UNIX_TIMESTAMP(NOW()));
	END
$$

DROP PROCEDURE IF EXISTS sea_ExistBaton $$
CREATE PROCEDURE sea_ExistBaton(IN p_sender_id INT, IN p_receiver_id INT, IN p_sended_time BIGINT UNSIGNED) 
	BEGIN
		DECLARE count TINYINT UNSIGNED;
		SELECT COUNT(*) INTO count FROM sea_user_baton WHERE receiver_id = p_receiver_id AND sender_id = p_sender_id AND p_sended_time = sended_time;

		IF count > 0 THEN
			SELECT 1 AS res;
		ELSE
			SELECT 0 AS res;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadBatonScore $$
CREATE PROCEDURE sea_LoadBatonScore(IN p_sender_id INT, IN p_receiver_id INT, IN p_sended_time BIGINT UNSIGNED) 
	BEGIN
		DECLARE count TINYINT UNSIGNED;
		SELECT COUNT(*) INTO count FROM sea_user_baton WHERE receiver_id = p_receiver_id AND sender_id = p_sender_id AND p_sended_time = sended_time;

		IF count > 0 THEN
			SELECT score FROM sea_user_baton WHERE sender_id = p_sender_id AND receiver_id = p_receiver_id AND sended_time = p_sended_time;
		ELSE
			SELECT -1 AS score;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadBaton $$
CREATE PROCEDURE sea_LoadBaton(IN p_receiver_id INT) 
	BEGIN
		DECLARE count SMALLINT UNSIGNED;
		SELECT COUNT(*) INTO count FROM sea_user_baton WHERE receiver_id = p_receiver_id;

		IF count > 0 THEN
			SELECT sender_id, score, map, sended_time FROM sea_user_baton WHERE receiver_id = p_receiver_id;
		ELSE
			SELECT 0 AS sender_id;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_DeleteBaton $$
CREATE PROCEDURE sea_DeleteBaton(IN p_sender_id INT, IN p_receiver_id INT, IN p_sended_time BIGINT UNSIGNED)
	BEGIN
		DELETE FROM sea_user_baton WHERE sender_id = p_sender_id AND receiver_id = p_receiver_id AND sended_time = p_sended_time;
	END
$$

DROP PROCEDURE IF EXISTS sea_DeleteExpiredBaton $$
CREATE PROCEDURE sea_DeleteExpiredBaton()
	BEGIN
		DELETE FROM sea_user_baton WHERE SUBDATE(NOW(), INTERVAL 20 DAY) > FROM_UNIXTIME(sended_time);
	END
$$

DELIMITER ;
