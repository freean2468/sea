USE sea;

DROP TABLE IF EXISTS sea_user_items;

CREATE TABLE sea.sea_user_items(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	shield TINYINT UNSIGNED NOT NULL,
	item_last TINYINT UNSIGNED NOT NULL,
	ghost TINYINT UNSIGNED NOT NULL,
	weapon_reinforce TINYINT UNSIGNED NOT NULL,
	exp_boost TINYINT UNSIGNED NOT NULL,
	max_attack TINYINT UNSIGNED NOT NULL,
	bonus_heart TINYINT UNSIGNED NOT NULL,
	drop_up TINYINT UNSIGNED NOT NULL,
	magnet TINYINT UNSIGNED NOT NULL,
	bonus_score TINYINT UNSIGNED NOT NULL,

	INDEX idx_user_items_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadItems $$
CREATE PROCEDURE sea_LoadItems(IN p_id INT)
	BEGIN
		SELECT shield, item_last, ghost, weapon_reinforce, exp_boost, max_attack, bonus_heart, drop_up, magnet, bonus_score  
		FROM sea_user_items WHERE id = p_id;
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

DROP PROCEDURE IF EXISTS sea_UpdateShield $$
CREATE PROCEDURE sea_UpdateShield(IN p_id INT, IN p_count TINYINT)
	BEGIN
		UPDATE sea_user_items SET shield = shield + p_count WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateGhost $$
CREATE PROCEDURE sea_UpdateGhost(IN p_id INT, IN p_count TINYINT)
	BEGIN
		UPDATE sea_user_items SET ghost = ghost + p_count WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateWeaponReinforce $$
CREATE PROCEDURE sea_UpdateWeaponReinforce(IN p_id INT, IN p_count TINYINT)
	BEGIN
		UPDATE sea_user_items SET weapon_reinforce = weapon_reinforce + p_count WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateBonusHeart $$
CREATE PROCEDURE sea_UpdateBonusHeart(IN p_id INT, IN p_count TINYINT)
	BEGIN
		UPDATE sea_user_items SET bonus_heart = bonus_heart + p_count WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateDropUp $$
CREATE PROCEDURE sea_UpdateDropUp(IN p_id INT, IN p_count TINYINT)
	BEGIN
		UPDATE sea_user_items SET drop_up = drop_up + p_count WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateMagnet $$
CREATE PROCEDURE sea_UpdateMagnet(IN p_id INT, IN p_count TINYINT)
	BEGIN
		UPDATE sea_user_items SET magnet = magnet + p_count WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateBonusScore $$
CREATE PROCEDURE sea_UpdateBonusScore(IN p_id INT, IN p_count TINYINT)
	BEGIN
		UPDATE sea_user_items SET bonus_score = bonus_score + p_count WHERE id = p_id;
	END
$$

DELIMITER ;
