USE sea;

DROP TABLE IF EXISTS sea_costume_1;

CREATE TABLE sea.sea_costume_1 (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	_1 TINYINT(1) UNSIGNED NOT NULL,
	_2 TINYINT(1) UNSIGNED NOT NULL,
	_3 TINYINT(1) UNSIGNED NOT NULL,
	_4 TINYINT(1) UNSIGNED NOT NULL,
	_5 TINYINT(1) UNSIGNED NOT NULL,
	_6 TINYINT(1) UNSIGNED NOT NULL,
	_7 TINYINT(1) UNSIGNED NOT NULL,
	_8 TINYINT(1) UNSIGNED NOT NULL,
	_9 TINYINT(1) UNSIGNED NOT NULL,
	_10 TINYINT(1) UNSIGNED NOT NULL,

	INDEX idx_costume_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_SelectCostume $$
CREATE PROCEDURE sea_SelectCostume(IN p_id INT)
	BEGIN
		SELECT _1._1, _1._2, _1._3, _1._4, _1._5, _1._6, _1._7, _1._8, _1._9, _1._10,
				_2._11, _2._12, _2._13, _2._14, _2._15, _2._16, _2._17, _2._18, _2._19, _2._20,
				_3._21
		FROM sea_costume_1 AS _1
		INNER JOIN sea.sea_costume_2 AS _2 ON p_id = _2.id
		INNER JOIN sea.sea_costume_3 AS _3 ON p_id = _3.id
		WHERE _1.id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostume_1 $$
CREATE PROCEDURE sea_OnCostume_1(IN p_id INT)
	BEGIN
		UPDATE sea_costume_1 SET _1 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostume_2 $$
CREATE PROCEDURE sea_OnCostume_2(IN p_id INT)
	BEGIN
		UPDATE sea_costume_2 SET _2 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostume_3 $$
CREATE PROCEDURE sea_OnCostume_3(IN p_id INT)
	BEGIN
		UPDATE sea_costume_3 SET _3 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostume_4 $$
CREATE PROCEDURE sea_OnCostume_4(IN p_id INT)
	BEGIN
		UPDATE sea_costume_4 SET _4 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostume_5 $$
CREATE PROCEDURE sea_OnCostume_5(IN p_id INT)
	BEGIN
		UPDATE sea_costume_5 SET _5 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostume_6 $$
CREATE PROCEDURE sea_OnCostume_6(IN p_id INT)
	BEGIN
		UPDATE sea_costume_6 SET _6 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostume_7 $$
CREATE PROCEDURE sea_OnCostume_7(IN p_id INT)
	BEGIN
		UPDATE sea_costume_7 SET _7 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostume_8 $$
CREATE PROCEDURE sea_OnCostume_8(IN p_id INT)
	BEGIN
		UPDATE sea_costume_8 SET _8 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostume_9 $$
CREATE PROCEDURE sea_OnCostume_9(IN p_id INT)
	BEGIN
		UPDATE sea_costume_9 SET _9 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostume_10 $$
CREATE PROCEDURE sea_OnCostume_10(IN p_id INT)
	BEGIN
		UPDATE sea_costume_10 SET _10 = 1 WHERE id = p_id;
	END
$$

DELIMITER ;
