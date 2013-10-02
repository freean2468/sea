USE sea;

DROP TABLE IF EXISTS sea_costume_top_1;

CREATE TABLE sea.sea_costume_top_1(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	_1 TINYINT(1) NOT NULL,
	_2 TINYINT(1) NOT NULL,
	_3 TINYINT(1) NOT NULL,
	_4 TINYINT(1) NOT NULL,
	_5 TINYINT(1) NOT NULL,
	_6 TINYINT(1) NOT NULL,
	_7 TINYINT(1) NOT NULL,
	_8 TINYINT(1) NOT NULL,
	_9 TINYINT(1) NOT NULL,
	_10 TINYINT(1) NOT NULL,

	INDEX idx_costume_top_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_SelectCostumeTop $$
CREATE PROCEDURE sea_SelectCostumeTop(IN p_id INT)
	BEGIN
		SELECT _1, _2, _3, _4, _5, _6, _7, _8, _9, _10 FROM sea_costume_top_1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostumeTop_1 $$
CREATE PROCEDURE sea_OnCostumeTop_1(IN p_id INT)
	BEGIN
		UPDATE sea_costume_top_1 SET _1 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostumeTop_2 $$
CREATE PROCEDURE sea_OnCostumeTop_2(IN p_id INT)
	BEGIN
		UPDATE sea_costume_top_1 SET _2 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostumeTop_3 $$
CREATE PROCEDURE sea_OnCostumeTop_3(IN p_id INT)
	BEGIN
		UPDATE sea_costume_top_1 SET _3 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostumeTop_4 $$
CREATE PROCEDURE sea_OnCostumeTop_4(IN p_id INT)
	BEGIN
		UPDATE sea_costume_top_1 SET _4 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostumeTop_5 $$
CREATE PROCEDURE sea_OnCostumeTop_5(IN p_id INT)
	BEGIN
		UPDATE sea_costume_top_1 SET _5 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostumeTop_6 $$
CREATE PROCEDURE sea_OnCostumeTop_6(IN p_id INT)
	BEGIN
		UPDATE sea_costume_top_1 SET _6 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostumeTop_7 $$
CREATE PROCEDURE sea_OnCostumeTop_7(IN p_id INT)
	BEGIN
		UPDATE sea_costume_top_1 SET _7 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostumeTop_8 $$
CREATE PROCEDURE sea_OnCostumeTop_8(IN p_id INT)
	BEGIN
		UPDATE sea_costume_top_1 SET _8 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostumeTop_9 $$
CREATE PROCEDURE sea_OnCostumeTop_9(IN p_id INT)
	BEGIN
		UPDATE sea_costume_top_1 SET _9 = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_OnCostumeTop_10 $$
CREATE PROCEDURE sea_OnCostumeTop_10(IN p_id INT)
	BEGIN
		UPDATE sea_costume_top_1 SET _10 = 1 WHERE id = p_id;
	END
$$

DELIMITER ;
