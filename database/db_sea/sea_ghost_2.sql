USE sea;

DROP TABLE IF EXISTS sea_ghost_2;

CREATE TABLE sea.sea_ghost_2(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	_21 SMALLINT UNSIGNED NOT NULL,
	_22 SMALLINT UNSIGNED NOT NULL,
	_23 SMALLINT UNSIGNED NOT NULL,
	_24 SMALLINT UNSIGNED NOT NULL,
	_25 SMALLINT UNSIGNED NOT NULL,
	_26 SMALLINT UNSIGNED NOT NULL,
	_27 SMALLINT UNSIGNED NOT NULL,
	_28 SMALLINT UNSIGNED NOT NULL,
	_29 SMALLINT UNSIGNED NOT NULL,
	_30 SMALLINT UNSIGNED NOT NULL,

	INDEX idx_ghost_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_21 $$
CREATE PROCEDURE sea_UpdateGhost_21(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _21 = _21 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_22 $$
CREATE PROCEDURE sea_UpdateGhost_22(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _22 = _22 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_23 $$
CREATE PROCEDURE sea_UpdateGhost_23(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _23 = _23 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_24 $$
CREATE PROCEDURE sea_UpdateGhost_24(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _24 = _24 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_25 $$
CREATE PROCEDURE sea_UpdateGhost_25(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _25 = _25 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_26 $$
CREATE PROCEDURE sea_UpdateGhost_26(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _26 = _26 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_27 $$
CREATE PROCEDURE sea_UpdateGhost_27(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _27 = _27 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_28 $$
CREATE PROCEDURE sea_UpdateGhost_28(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _28 = _28 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_29 $$
CREATE PROCEDURE sea_UpdateGhost_29(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _29 = _29 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_30 $$
CREATE PROCEDURE sea_UpdateGhost_30(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _30 = _30 + p_amount WHERE id = p_id;
	END
$$

DELIMITER ;
