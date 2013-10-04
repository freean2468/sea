USE sea;

DROP TABLE IF EXISTS sea_item;

CREATE TABLE sea.sea_item(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	shield TINYINT UNSIGNED NOT NULL,
	item_last TINYINT UNSIGNED NOT NULL,
	ghostify TINYINT UNSIGNED NOT NULL,
	immortal TINYINT UNSIGNED NOT NULL,
	exp_boost TINYINT UNSIGNED NOT NULL,
	random TINYINT UNSIGNED NOT NULL,

	INDEX idx_item_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadItems $$
CREATE PROCEDURE sea_LoadItems(IN p_id INT)
	BEGIN
		SELECT shield, item_last, ghostify, immortal, exp_boost, random
		FROM sea_item WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateShield $$
CREATE PROCEDURE sea_UpdateShield(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET shield = shield + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateItemLast $$
CREATE PROCEDURE sea_UpdateItemLast(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET item_last = item_last + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhostify $$
CREATE PROCEDURE sea_UpdateGhostify(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET ghostify = ghostify + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateImmortal $$
CREATE PROCEDURE sea_UpdateImmortal(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET immortal = immortal + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateExpBoost $$
CREATE PROCEDURE sea_UpdateExpBoost(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET exp_boost = exp_boost + p_amount WHERE id = p_id;
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
