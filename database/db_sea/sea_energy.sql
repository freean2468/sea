USE sea;

DROP TABLE IF EXISTS sea_energy;

CREATE TABLE sea.sea_energy(
	sender_id INT NOT NULL,
	receiver_id INT NOT NULL,
	sended_time BIGINT UNSIGNED NOT NULL,

	PRIMARY KEY(sender_id, receiver_id, sended_time),
	FOREIGN KEY(sender_id) REFERENCES sea_user(id) ON DELETE CASCADE ON UPDATE RESTRICT,
	FOREIGN KEY(receiver_id) REFERENCES sea_user(id) ON DELETE CASCADE ON UPDATE RESTRICT,

	INDEX idx_energy_1(sender_id, receiver_id),
	INDEX idx_energy_2(sended_time)
);

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_AddEnergy $$
CREATE PROCEDURE sea_AddEnergy(IN p_sender_id INT, IN p_receiver_id INT)
	BEGIN
		INSERT sea_energy(sender_id, receiver_id, sended_time)
		VALUES (p_sender_id, p_receiver_id, UNIX_TIMESTAMP(NOW()));
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadEnergyBySender $$
CREATE PROCEDURE sea_LoadEnergyBySender(IN p_sender_id INT) 
	BEGIN
		DECLARE count SMALLINT UNSIGNED;
		SELECT COUNT(*) INTO count FROM sea_energy WHERE sender_id = p_sender_id;

		IF count > 0 THEN
			SELECT receiver_id, sended_time FROM sea_energy WHERE sender_id = p_sender_id;
		else
			SELECT 0 AS receiver_id;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadEnergyByReceiver $$
CREATE PROCEDURE sea_LoadEnergyByReceiver(IN p_receiver_id INT) 
	BEGIN
		DECLARE count SMALLINT UNSIGNED;
		SELECT COUNT(*) INTO count FROM sea_energy WHERE receiver_id = p_receiver_id;

		IF count > 0 THEN
			SELECT sender_id, sended_time  FROM sea_energy WHERE receiver_id = p_receiver_id;
		ELSE
			SELECT 0 AS sender_id;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_AcceptEnergy $$
CREATE PROCEDURE sea_AcceptEnergy(IN p_sender_id INT, IN p_receiver_id INT, IN p_sended_time BIGINT UNSIGNED)
	BEGIN
		DECLARE count TINYINT UNSIGNED;
		SELECT COUNT(*) INTO count FROM sea_energy WHERE sender_id = p_sender_id AND receiver_id = p_receiver_id AND sended_time = p_sended_time;

		IF count > 0 THEN
			DELETE FROM sea_energy WHERE p_sender_id = sender_id AND p_receiver_id = receiver_id AND p_sended_time = sended_time;
			CALL sea_LoadEnergy(p_receiver_id);
		ELSE
			SELECT -1 AS res;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_DeleteExpiredEnergy $$
CREATE PROCEDURE sea_DeleteExpiredEnergy()
	BEGIN
		DELETE FROM sea_energy WHERE SUBDATE(NOW(), INTERVAL 20 DAY) > FROM_UNIXTIME(sended_time);
	END
$$

DELIMITER ;
