USE sea;

DROP TABLE IF EXISTS sea_user_baton_result;

CREATE TABLE sea.sea_user_baton_result (
	sender_id INT UNSIGNED NOT NULL,
	receiver_id INT UNSIGNED NOT NULL,
	score INT UNSIGNED NOT NULL,
	sended_time BIGINT UNSIGNED NOT NULL,

	PRIMARY KEY(sender_id, receiver_id, sended_time),
	FOREIGN KEY(sender_id) REFERENCES sea_user(id) ON DELETE CASCADE ON UPDATE RESTRICT,
	FOREIGN KEY(receiver_id) REFERENCES sea_user(id) ON DELETE CASCADE ON UPDATE RESTRICT,

	INDEX idx_user_baton_result_1(sender_id, receiver_id),
	INDEX idx_user_baton_result_2(sended_time)
);

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_AddBatonResult $$
CREATE PROCEDURE sea_AddBatonResult(IN p_sender_id INT UNSIGNED, IN p_receiver_id INT UNSIGNED, IN p_score INT UNSIGNED)
	BEGIN
		INSERT sea_user_baton_result(sender_id, receiver_id, score, sended_time)
		VALUES (p_sender_id, p_receiver_id, p_score, UNIX_TIMESTAMP(NOW()));
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadBatonResultScore $$
CREATE PROCEDURE sea_LoadBatonResultScore(IN p_sender_id INT UNSIGNED, IN p_receiver_id INT UNSIGNED, IN p_sended_time BIGINT UNSIGNED)
	BEGIN
		DECLARE count INT UNSIGNED;
		SELECT COUNT(*) INTO count FROM sea_user_baton_result WHERE sender_id = p_sender_id AND receiver_id = p_receiver_id AND sended_time = p_sended_time;

		IF count > 0 THEN
			SELECT score FROM sea_user_baton_result WHERE receiver_id = p_receiver_id;
		else
			SELECT -1 AS score;
		END IF;	
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadBatonResult $$
CREATE PROCEDURE sea_LoadBatonResult(IN p_receiver_id INT UNSIGNED) 
	BEGIN
		DECLARE count INT UNSIGNED;
		SELECT COUNT(*) INTO count FROM sea_user_baton_result WHERE receiver_id = p_receiver_id;

		IF count > 0 THEN
			SELECT sender_id, score, sended_time FROM sea_user_baton_result WHERE receiver_id = p_receiver_id;
		else
			SELECT 0 AS sender_id;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_DeleteBatonResult $$
CREATE PROCEDURE sea_DeleteBatonResult(IN p_sender_id INT UNSIGNED, IN p_receiver_id INT UNSIGNED, IN p_sended_time BIGINT UNSIGNED)
	BEGIN
		DELETE FROM sea_user_baton_result WHERE sender_id = p_sender_id AND receiver_id = p_receiver_id AND sended_time = p_sended_time;
	END
$$

DROP PROCEDURE IF EXISTS sea_DeleteExpiredBatonResult $$
CREATE PROCEDURE sea_DeleteExpiredBatonResult()
	BEGIN
		DELETE FROM sea_user_baton_result WHERE SUBDATE(NOW(), INTERVAL 20 DAY) > FROM_UNIXTIME(sended_time);
	END
$$

DELIMITER ;
