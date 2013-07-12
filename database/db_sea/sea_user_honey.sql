USE sea;

DROP TABLE IF EXISTS sea_user_honey;

CREATE TABLE sea.sea_user_honey(
	sender_id INT NOT NULL,
	receiver_id INT NOT NULL,
	sended_time BIGINT NOT NULL,

	PRIMARY KEY(sender_id, receiver_id, sended_time),
	FOREIGN KEY(sender_id) REFERENCES sea_user(id) ON DELETE CASCADE ON UPDATE RESTRICT,
	FOREIGN KEY(receiver_id) REFERENCES sea_user(id) ON DELETE CASCADE ON UPDATE RESTRICT,

	INDEX idx_user_honey_1(sender_id, receiver_id),
	INDEX idx_user_honey_2(sended_time)
);

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_AddHoney $$
CREATE PROCEDURE sea_AddHoney(IN p_sender_id INT, IN p_receiver_id INT)
	BEGIN
		INSERT sea_user_honey(sender_id, receiver_id, sended_time)
		VALUES (p_sender_id, p_receiver_id, UNIX_TIMESTAMP(NOW()));
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadHoneyBySender $$
CREATE PROCEDURE sea_LoadHoneyBySender(IN p_sender_id INT) 
	BEGIN
		DECLARE count INT;
		SELECT COUNT(*) INTO count FROM sea_user_honey WHERE sender_id = p_sender_id;

		IF count > 0 THEN
			SELECT receiver_id, sended_time FROM sea_user_honey WHERE sender_id = p_sender_id;
		else
			SELECT 0 AS receiver_id;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadHoneyByReceiver $$
CREATE PROCEDURE sea_LoadHoneyByReceiver(IN p_receiver_id INT) 
	BEGIN
		DECLARE count INT;
		SELECT COUNT(*) INTO count FROM sea_user_honey WHERE receiver_id = p_receiver_id;

		IF count > 0 THEN
			SELECT sender_id, sended_time  FROM sea_user_honey WHERE receiver_id = p_receiver_id;
		else
			SELECT 0 AS sender_id;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_AcceptHoney $$
CREATE PROCEDURE sea_AcceptHoney(IN p_sender_id INT, IN p_receiver_id INT, IN p_sended_time BIGINT)
	BEGIN
		DELETE FROM sea_user_honey WHERE p_sender_id = sender_id AND p_receiver_id = receiver_id AND p_sended_time = sended_time;
		CALL sea_LoadHoney(p_receiver_id);
	END
$$

DROP PROCEDURE IF EXISTS sea_DeleteExpiredHoney $$
CREATE PROCEDURE sea_DeleteExpiredHoney()
	BEGIN
		DELETE FROM sea_user_honey WHERE SUBDATE(NOW(), INTERVAL 20 DAY) > FROM_UNIXTIME(sended_time);
	END
$$

DELIMITER ;
