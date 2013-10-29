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

	INDEX idx_ghost_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadGhosts $$
CREATE PROCEDURE sea_LoadGhosts(IN p_id INT)
	BEGIN
		SELECT _1._1, _1._2, _1._3, _1._4, _1._5, _1._6, _1._7, _1._8, _1._9, _1._10,
				_2._11, _2._12, _2._13, _2._14, _2._15, _2._16, _2._17, _2._18, _2._19, _2._20,
				_3._21, _3._22, _3._23, _3._24, _3._25, _3._26, _3._27, _3._28, _3._29, _3._30
		FROM sea_ghost_1 AS _1 
		INNER JOIN sea.sea_ghost_2 AS _2 ON p_id = _2.id
		INNER JOIN sea.sea_ghost_3 AS _3 ON p_id = _3.id
		WHERE _1.id = p_id;
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

DELIMITER ;
