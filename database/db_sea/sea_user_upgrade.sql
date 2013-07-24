USE sea;

DROP TABLE IF EXISTS sea_user_upgrade;

CREATE TABLE sea.sea_user_upgrade (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	honey_score TINYINT NOT NULL,
	honey_time TINYINT NOT NULL,
	cooldown TINYINT NOT NULL,

	INDEX idx_user_upgrade_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadUpgradeInfo $$
CREATE PROCEDURE sea_LoadUpgradeInfo(IN p_id INT)
	BEGIN
		SELECT honey_score, honey_time, cooldown FROM sea_user_upgrade WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpgradeHoneyScore $$
CREATE PROCEDURE sea_UpgradeHoneyScore(IN p_id INT)
	BEGIN
		UPDATE sea_user_upgrade SET honey_score = honey_score + 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpgradeHoneyTime $$
CREATE PROCEDURE sea_UpgradeHoneyTime(IN p_id INT)
	BEGIN
		UPDATE sea_user_upgrade SET honey_time = honey_time + 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpgradeCooldown $$
CREATE PROCEDURE sea_UpgradeCooldown(IN p_id INT)
	BEGIN
		UPDATE sea_user_upgrade SET cooldown = cooldown + 1 WHERE id = p_id;
	END
$$

DELIMITER ;
