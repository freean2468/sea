USE sea;

DROP TABLE IF EXISTS sea_ghost_house;

CREATE TABLE sea.sea_ghost_house(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	room_1 TINYINT NOT NULL,
	room_2 TINYINT NOT NULL,
	room_3 TINYINT NOT NULL,
	room_4 TINYINT NOT NULL,
	room_5 TINYINT NOT NULL,

	INDEX idx_ghost_house_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadGhostHouse $$
CREATE PROCEDURE sea_LoadGhostHouse(IN p_id INT)
	BEGIN
		SELECT room_1, room_2, room_3, room_4, room_5 FROM sea_ghost_house WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_PurchaseRoom_1 $$
CREATE PROCEDURE sea_PurchaseRoom_1(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET room_1 = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_PurchaseRoom_2 $$
CREATE PROCEDURE sea_PurchaseRoom_2(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET room_2 = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_PurchaseRoom_3 $$
CREATE PROCEDURE sea_PurchaseRoom_3(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET room_3 = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_PurchaseRoom_4 $$
CREATE PROCEDURE sea_PurchaseRoom_4(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET room_4 = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_PurchaseRoom_5 $$
CREATE PROCEDURE sea_PurchaseRoom_5(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET room_5 = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_SetGhostTo_1 $$
CREATE PROCEDURE sea_SetGhostTo_1(IN p_id INT, IN p_ghost TINYINT)
	BEGIN
		UPDATE sea_ghost_house SET room_1 = p_ghost WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_SetGhostTo_2 $$
CREATE PROCEDURE sea_SetGhostTo_2(IN p_id INT, IN p_ghost TINYINT)
	BEGIN
		UPDATE sea_ghost_house SET room_2 = p_ghost WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_SetGhostTo_3 $$
CREATE PROCEDURE sea_SetGhostTo_3(IN p_id INT, IN p_ghost TINYINT)
	BEGIN
		UPDATE sea_ghost_house SET room_3 = p_ghost WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_SetGhostTo_4 $$
CREATE PROCEDURE sea_SetGhostTo_4(IN p_id INT, IN p_ghost TINYINT)
	BEGIN
		UPDATE sea_ghost_house SET room_4 = p_ghost WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_SetGhostTo_5 $$
CREATE PROCEDURE sea_SetGhostTo_5(IN p_id INT, IN p_ghost TINYINT)
	BEGIN
		UPDATE sea_ghost_house SET room_5 = p_ghost WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_RemoveGhostFrom_1 $$
CREATE PROCEDURE sea_RemoveGhostFrom_1(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET room_1 = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_RemoveGhostFrom_2 $$
CREATE PROCEDURE sea_RemoveGhostFrom_2(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET room_2 = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_RemoveGhostFrom_3 $$
CREATE PROCEDURE sea_RemoveGhostFrom_3(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET room_3 = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_RemoveGhostFrom_4 $$
CREATE PROCEDURE sea_RemoveGhostFrom_4(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET room_4 = 0 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_RemoveGhostFrom_5 $$
CREATE PROCEDURE sea_RemoveGhostFrom_5(IN p_id INT)
	BEGIN
		UPDATE sea_ghost_house SET room_5 = 0 WHERE id = p_id;
	END
$$

DELIMITER ;
