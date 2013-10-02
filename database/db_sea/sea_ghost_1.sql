USE sea;

DROP TABLE IF EXISTS sea_ghost_1;

CREATE TABLE sea.sea_ghost_1(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	_1 SMALLINT UNSIGNED NOT NULL,
	_2 SMALLINT UNSIGNED NOT NULL,
	_3 SMALLINT UNSIGNED NOT NULL,
	_4 SMALLINT UNSIGNED NOT NULL,
	_5 SMALLINT UNSIGNED NOT NULL,
	_6 SMALLINT UNSIGNED NOT NULL,
	_7 SMALLINT UNSIGNED NOT NULL,
	_8 SMALLINT UNSIGNED NOT NULL,
	_9 SMALLINT UNSIGNED NOT NULL,
	_10 SMALLINT UNSIGNED NOT NULL,
	_11 SMALLINT UNSIGNED NOT NULL,
	_13 SMALLINT UNSIGNED NOT NULL,
	_14 SMALLINT UNSIGNED NOT NULL,
	_15 SMALLINT UNSIGNED NOT NULL,
	_16 SMALLINT UNSIGNED NOT NULL,
	_17 SMALLINT UNSIGNED NOT NULL,
	_18 SMALLINT UNSIGNED NOT NULL,
	_19 SMALLINT UNSIGNED NOT NULL,
	_20 SMALLINT UNSIGNED NOT NULL,

	INDEX idx_ghost_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadGhosts $$
CREATE PROCEDURE sea_LoadGhosts(IN p_id INT)
	BEGIN
		SELECT _1._1, _1._2, _1._3, _1._4, _1._5, _1._6, _1._7, _1._8, _1._9, _1._10,
				_1._11, _1._12, _1._13, _1._14, _1._15, _1._16, _1._17, _1._18, _1._19, _1._20,
				_2._21, _2._22, _2._23, _2._24, _2._25, _2._26, _2._27, _2._28, _2._29, _2._30
		FROM sea_ghost_1 AS _1 
		INNER JOIN sea.sea_ghost_2 AS _2 ON p_id = _2.id
		WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_1 $$
CREATE PROCEDURE sea_UpdateGhost_1(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _1 = _1 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_2 $$
CREATE PROCEDURE sea_UpdateGhost_2(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _2 = _2 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_3 $$
CREATE PROCEDURE sea_UpdateGhost_3(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _3 = _3 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_4 $$
CREATE PROCEDURE sea_UpdateGhost_4(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _4 = _4 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_5 $$
CREATE PROCEDURE sea_UpdateGhost_5(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _5 = _5 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_6 $$
CREATE PROCEDURE sea_UpdateGhost_6(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _6 = _6 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_7 $$
CREATE PROCEDURE sea_UpdateGhost_7(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _7 = _7 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_8 $$
CREATE PROCEDURE sea_UpdateGhost_8(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _8 = _8 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_9 $$
CREATE PROCEDURE sea_UpdateGhost_9(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _9 = _9 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_10 $$
CREATE PROCEDURE sea_UpdateGhost_10(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _10 = _10 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_11 $$
CREATE PROCEDURE sea_UpdateGhost_11(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _11 = _11 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_12 $$
CREATE PROCEDURE sea_UpdateGhost_12(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _12 = _12 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_13 $$
CREATE PROCEDURE sea_UpdateGhost_13(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _13 = _13 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_14 $$
CREATE PROCEDURE sea_UpdateGhost_14(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _14 = _14 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_15 $$
CREATE PROCEDURE sea_UpdateGhost_15(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _15 = _15 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_16 $$
CREATE PROCEDURE sea_UpdateGhost_16(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _16 = _16 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_17 $$
CREATE PROCEDURE sea_UpdateGhost_17(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _17 = _17 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_18 $$
CREATE PROCEDURE sea_UpdateGhost_18(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _18 = _18 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_19 $$
CREATE PROCEDURE sea_UpdateGhost_19(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _19 = _19 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost_20 $$
CREATE PROCEDURE sea_UpdateGhost_20(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_ghost_1 SET _20 = _20 + p_amount WHERE id = p_id;
	END
$$

DELIMITER ;
