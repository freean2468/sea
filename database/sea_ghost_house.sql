USE sea;

DROP TABLE IF EXISTS sea_ghost_house;

CREATE TABLE sea.sea_ghost_house(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	_1 TINYINT NOT NULL,
	_2 TINYINT NOT NULL,
	_3 TINYINT NOT NULL,
	_4 TINYINT NOT NULL,
	_5 TINYINT NOT NULL,
	_1_time BIGINT UNSIGNED NOT NULL,
	_2_time BIGINT UNSIGNED NOT NULL,
	_3_time BIGINT UNSIGNED NOT NULL,
	_4_time BIGINT UNSIGNED NOT NULL,
	_5_time BIGINT UNSIGNED NOT NULL,

	INDEX idx_ghost_house_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadGhostHouse $$
CREATE PROCEDURE sea_LoadGhostHouse(IN p_id INT)
	BEGIN
		SELECT _1, _2, _3, _4, _5, _1_time, _2_time, _3_time, _4_time, _5_time FROM sea_ghost_house WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_PurchaseHouse_2 $$
CREATE PROCEDURE sea_PurchaseHouse_2(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET _2 = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_PurchaseHouse_3 $$
CREATE PROCEDURE sea_PurchaseHouse_3(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET _3 = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_PurchaseHouse_4 $$
CREATE PROCEDURE sea_PurchaseHouse_4(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET _4 = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_PurchaseHouse_5 $$
CREATE PROCEDURE sea_PurchaseHouse_5(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET _5 = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_SetGhostTo_1 $$
CREATE PROCEDURE sea_SetGhostTo_1(IN p_id INT, IN p_ghost TINYINT)
	BEGIN
		UPDATE sea_ghost_house SET _1 = p_ghost, _1_time = UNIX_TIMESTAMP(NOW()) WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_SetGhostTo_2 $$
CREATE PROCEDURE sea_SetGhostTo_2(IN p_id INT, IN p_ghost TINYINT)
	BEGIN
		UPDATE sea_ghost_house SET _2 = p_ghost, _2_time = UNIX_TIMESTAMP(NOW()) WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_SetGhostTo_3 $$
CREATE PROCEDURE sea_SetGhostTo_3(IN p_id INT, IN p_ghost TINYINT)
	BEGIN
		UPDATE sea_ghost_house SET _3 = p_ghost, _3_time = UNIX_TIMESTAMP(NOW()) WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_SetGhostTo_4 $$
CREATE PROCEDURE sea_SetGhostTo_4(IN p_id INT, IN p_ghost TINYINT)
	BEGIN
		UPDATE sea_ghost_house SET _4 = p_ghost, _4_time = UNIX_TIMESTAMP(NOW()) WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_SetGhostTo_5 $$
CREATE PROCEDURE sea_SetGhostTo_5(IN p_id INT, IN p_ghost TINYINT)
	BEGIN
		UPDATE sea_ghost_house SET _5 = p_ghost, _5_time = UNIX_TIMESTAMP(NOW()) WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_RemoveGhostFrom_1 $$
CREATE PROCEDURE sea_RemoveGhostFrom_1(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET _1 = 0, _1_time = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_RemoveGhostFrom_2 $$
CREATE PROCEDURE sea_RemoveGhostFrom_2(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET _2 = 0, _2_time = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_RemoveGhostFrom_3 $$
CREATE PROCEDURE sea_RemoveGhostFrom_3(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET _3 = 0, _3_time = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_RemoveGhostFrom_4 $$
CREATE PROCEDURE sea_RemoveGhostFrom_4(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET _4 = 0, _4_time = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_RemoveGhostFrom_5 $$
CREATE PROCEDURE sea_RemoveGhostFrom_5(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET _5 = 0, _5_time = 0 WHERE id = p_id;
	END
$$

DELIMITER ;
