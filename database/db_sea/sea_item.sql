USE sea;

DROP TABLE IF EXISTS sea_item;

CREATE TABLE sea.sea_item(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	shield TINYINT UNSIGNED NOT NULL,
	item_last TINYINT UNSIGNED NOT NULL,
	ghostify TINYINT UNSIGNED NOT NULL,
	weapon_reinforce TINYINT UNSIGNED NOT NULL,
	exp_boost TINYINT UNSIGNED NOT NULL,
	max_attack TINYINT UNSIGNED NOT NULL,
	bonus_heart TINYINT UNSIGNED NOT NULL,
	drop_up TINYINT UNSIGNED NOT NULL,
	magnet TINYINT UNSIGNED NOT NULL,
	bonus_score TINYINT UNSIGNED NOT NULL,

	INDEX idx_items_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadItems $$
CREATE PROCEDURE sea_LoadItems(IN p_id INT)
	BEGIN
		SELECT shield, item_last, ghostify, weapon_reinforce, exp_boost, max_attack, bonus_heart, drop_up, magnet, bonus_score
		FROM sea_item WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateExpBoost $$
CREATE PROCEDURE sea_UpdateExpBoost(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET exp_boost = exp_boost + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateItemLast $$
CREATE PROCEDURE sea_UpdateItemLast(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET item_last = item_last + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateMaxAttack $$
CREATE PROCEDURE sea_UpdateMaxAttack(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET max_attack = max_attack + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateShield $$
CREATE PROCEDURE sea_UpdateShield(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET shield = shield + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhostify $$
CREATE PROCEDURE sea_UpdateGhostify(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET ghostify = ghostify + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateWeaponReinforce $$
CREATE PROCEDURE sea_UpdateWeaponReinforce(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET weapon_reinforce = weapon_reinforce + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateBonusHeart $$
CREATE PROCEDURE sea_UpdateBonusHeart(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET bonus_heart = bonus_heart + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateDropUp $$
CREATE PROCEDURE sea_UpdateDropUp(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET drop_up = drop_up + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateMagnet $$
CREATE PROCEDURE sea_UpdateMagnet(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET magnet = magnet + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateBonusScore $$
CREATE PROCEDURE sea_UpdateBonusScore(IN p_id INT, IN p_amount TINYINT)
	BEGIN
		UPDATE sea_item SET bonus_score = bonus_score + p_amount WHERE id = p_id;
	END
$$

DELIMITER ;
