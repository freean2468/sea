USE sea;

########################
##
########################
DROP TABLE IF EXISTS sea_user_items;

CREATE TABLE sea.sea_user_items(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	exp_boost TINYINT NOT NULL,
	item_last TINYINT NOT NULL,
	max_attack TINYINT NOT NULL,
	random TINYINT NOT NULL,

	INDEX idx_user_items_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadItems $$
CREATE PROCEDURE sea_LoadItems(IN p_id INT)
	BEGIN
		SELECT exp_boost, item_last, max_attack, random FROM sea_user_items WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateExpBoost $$
CREATE PROCEDURE sea_UpdateExpBoost(IN p_id INT, IN p_count TINYINT)
	BEGIN
		UPDATE sea_user_items SET exp_boost = exp_boost + p_count WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateItemLast $$
CREATE PROCEDURE sea_UpdateItemLast(IN p_id INT, IN p_count TINYINT)
	BEGIN
		UPDATE sea_user_items SET item_last = item_last + p_count WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateMaxAttack $$
CREATE PROCEDURE sea_UpdateMaxAttack(IN p_id INT, IN p_count TINYINT)
	BEGIN
		UPDATE sea_user_items SET max_attack = max_attack + p_count WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateRandom $$
CREATE PROCEDURE sea_UpdateRandom(IN p_id INT, IN p_random TINYINT)
	BEGIN
		UPDATE sea_user_items SET random = p_random WHERE id = p_id;
	END
$$

DELIMITER ;
