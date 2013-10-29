USE sea;

DROP TABLE IF EXISTS sea_ghost_2;

CREATE TABLE sea.sea_ghost_2(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	_11 SMALLINT UNSIGNED NOT NULL,
	_12 SMALLINT UNSIGNED NOT NULL,
	_13 SMALLINT UNSIGNED NOT NULL,
	_14 SMALLINT UNSIGNED NOT NULL,
	_15 SMALLINT UNSIGNED NOT NULL,
	_16 SMALLINT UNSIGNED NOT NULL,
	_17 SMALLINT UNSIGNED NOT NULL,
	_18 SMALLINT UNSIGNED NOT NULL,
	_19 SMALLINT UNSIGNED NOT NULL,
	_20 SMALLINT UNSIGNED NOT NULL,

	INDEX idx_ghost_2 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_11 $$
CREATE PROCEDURE sea_UpdateGhost_11(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _11 = _11 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_12 $$
CREATE PROCEDURE sea_UpdateGhost_12(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _12 = _12 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_13 $$
CREATE PROCEDURE sea_UpdateGhost_13(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _13 = _13 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_14 $$
CREATE PROCEDURE sea_UpdateGhost_14(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _14 = _14 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_15 $$
CREATE PROCEDURE sea_UpdateGhost_15(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _15 = _15 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_16 $$
CREATE PROCEDURE sea_UpdateGhost_16(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _16 = _16 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_17 $$
CREATE PROCEDURE sea_UpdateGhost_17(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _17 = _17 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_18 $$
CREATE PROCEDURE sea_UpdateGhost_18(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _18 = _18 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_19 $$
CREATE PROCEDURE sea_UpdateGhost_19(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _19 = _19 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_20 $$
CREATE PROCEDURE sea_UpdateGhost_20(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_2 SET _20 = _20 + p_amount WHERE id = p_id;
	END
$$

DELIMITER ;
