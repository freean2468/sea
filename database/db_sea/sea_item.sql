USE sea;

DROP TABLE IF EXISTS sea_item;

CREATE TABLE sea.sea_item(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	_1 TINYINT UNSIGNED NOT NULL,
	_2 TINYINT UNSIGNED NOT NULL,
	_3 TINYINT UNSIGNED NOT NULL,
	_4 TINYINT UNSIGNED NOT NULL,
	_5 TINYINT UNSIGNED NOT NULL,
	random TINYINT UNSIGNED NOT NULL,

	INDEX idx_item_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadItems $$
CREATE PROCEDURE sea_LoadItems(IN p_id INT)
	BEGIN
		SELECT _1, _2, _3, _4, _5, random
		FROM sea_item WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateItem_1 $$
CREATE PROCEDURE sea_UpdateItem_1(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET _1 = _1 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateItem_2 $$
CREATE PROCEDURE sea_UpdateItem_2(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET _2 = _2 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateItem_3 $$
CREATE PROCEDURE sea_UpdateItem_3(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET _3 = _3 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateItem_4 $$
CREATE PROCEDURE sea_UpdateItem_4(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET _4 = _4 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateItem_5 $$
CREATE PROCEDURE sea_UpdateItem_5(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET _5 = _5 + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateRandom $$
CREATE PROCEDURE sea_UpdateRandom(IN p_id INT, IN p_type TINYINT)
	BEGIN
		DECLARE _random TINYINT UNSIGNED;
		SELECT random INTO _random FROM sea_item WHERE id = p_id;
		UPDATE sea_item SET random = p_type WHERE id = p_id;
		SELECT _random;
	END
$$

DELIMITER ;
