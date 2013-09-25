USE sea;

DROP TABLE IF EXISTS sea_user_upgrade;

CREATE TABLE sea.sea_user_upgrade (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	bonus_score TINYINT NOT NULL,
	bonus_time TINYINT NOT NULL,
	cooldown TINYINT NOT NULL,

	INDEX idx_user_upgrade_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadUpgradeInfo $$
CREATE PROCEDURE sea_LoadUpgradeInfo(IN p_id INT)
	BEGIN
		SELECT bonus_score, bonus_time, cooldown FROM sea_user_upgrade WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpgradeBonusScore $$
CREATE PROCEDURE sea_UpgradeBonusScore(IN p_id INT)
	BEGIN
		UPDATE sea_user_upgrade SET bonus_score = bonus_score + 1 WHERE id = p_id;
		SELECT bonus_score AS res FROM sea_user_upgrade WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpgradeBonusTime $$
CREATE PROCEDURE sea_UpgradeBonusTime(IN p_id INT)
	BEGIN
		UPDATE sea_user_upgrade SET bonus_time = bonus_time + 1 WHERE id = p_id;
		SELECT bonus_time AS res FROM sea_user_upgrade WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpgradeCooldown $$
CREATE PROCEDURE sea_UpgradeCooldown(IN p_id INT)
	BEGIN
		UPDATE sea_user_upgrade SET cooldown = cooldown + 1 WHERE id = p_id;
		SELECT cooldown AS res FROM sea_user_upgrade WHERE id = p_id;
	END
$$

DELIMITER ;
