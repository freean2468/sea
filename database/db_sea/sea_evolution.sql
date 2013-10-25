USE sea;

DROP TABLE IF EXISTS sea_evolution;

CREATE TABLE sea.sea_evolution (
	sender_id INT NOT NULL,
	receiver_id INT NOT NULL,
	character_id TINYINT UNSIGNED NOT NULL,
	sended_time BIGINT UNSIGNED NOT NULL,
	accepted TINYINT(1) NOT NULL,

	PRIMARY KEY(sender_id, receiver_id, sended_time),
	FOREIGN KEY(sender_id) REFERENCES sea_user(id) ON DELETE CASCADE ON UPDATE RESTRICT,
	FOREIGN KEY(receiver_id) REFERENCES sea_user(id) ON DELETE CASCADE ON UPDATE RESTRICT,

	INDEX idx_evolution_1(sender_id, receiver_id, character_id)
);

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_AcceptEvolution $$
CREATE PROCEDURE sea_AcceptEvolution(IN p_sender_id INT, IN p_receiver_id INT, IN p_character_id TINYINT UNSIGNED)
	BEGIN
		UPDATE sea_evolution SET accepted = 1 WHERE sender_id = p_sender_id AND receiver_id = p_receiver_id AND character_id = p_character_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_AddEvolution $$
CREATE PROCEDURE sea_AddEvolution(IN p_sender_id INT, IN p_receiver_id INT, IN p_character_id TINYINT UNSIGNED)
	BEGIN
		INSERT sea_AddEvolution(sender_id, receiver_id, character_id, sended_time, accepted)
		VALUES (p_sender_id, p_receiver_id, p_character_id, UNIX_TIMESTAMP(NOW()), 0);
	END
$$

DROP PROCEDURE IF EXISTS sea_ExistEvolution $$
CREATE PROCEDURE sea_ExistEvolution(IN p_sender_id INT, IN p_receiver_id INT, IN p_character_id TINYINT UNSIGNED)
	BEGIN
		DECLARE count TINYINT UNSIGNED;
		SELECT COUNT(*) INTO count FROM sea_evolution WHERE sender_id = p_sender_id AND receiver_id = p_receiver_id AND character_id = p_character_id;

		IF count > 0 THEN
			SELECT 1 AS res;
		ELSE
			SELECT 0 AS res;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadEvolutionProgress $$
CREATE PROCEDURE sea_LoadEvolutionProgress(IN p_sender_id INT, IN p_character_id TINYINT UNSIGNED)
	BEGIN
		SELECT receiver_id, character_id, sended_time, accepted FROM sea_evolution WHERE sender_id = p_sender_id AND character_id = p_character_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadEvolutionByReceiverId $$
CREATE PROCEDURE sea_LoadEvolutionByReceiverId(IN p_receiver_id INT)
	BEGIN
		DECLARE count SMALLINT UNSIGNED;
		SELECT COUNT(*) INTO count FROM sea_evolution WHERE receiver_id = p_receiver_id;

		IF count > 0 THEN
			SELECT sender_id, character_id, sended_time, accepted FROM sea_evolution WHERE receiver_id = p_receiver_id;
		ELSE
			SELECT 0 AS sender_id;
		END IF;
	END
$$

DROP PROCEDURE IF EXISTS sea_DeleteExpiredEvolution $$
CREATE PROCEDURE sea_DeleteExpiredEvolution()
	BEGIN
		DELETE FROM sea_evolution WHERE SUBDATE(NOW(), INTERVAL 20 DAY) > FROM_UNIXTIME(sended_time);
	END
$$

DROP PROCEDURE IF EXISTS sea_DeleteEvolution $$
CREATE PROCEDURE sea_DeleteEvolution(IN p_sender_id INT, IN p_character_id INT UNSIGNED)
	BEGIN
		DELETE FROM sea_evolution WHERE sender_id = p_sender_id AND character_id = p_character_id;
	END
$$

DELIMITER ;
