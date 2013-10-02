USE sea;

DROP TABLE IF EXISTS sea_upgrade;

CREATE TABLE sea.sea_upgrade (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	score_factor TINYINT UNSIGNED NOT NULL,
	time_factor TINYINT UNSIGNED NOT NULL,
	cooldown_factor TINYINT UNSIGNED NOT NULL,

	INDEX idx_upgrade_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadUpgrade $$
CREATE PROCEDURE sea_LoadUpgrade(IN p_id INT)
	BEGIN
		SELECT score_factor, time_factor, cooldown_factor FROM sea_upgrade WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpgradeScoreFactor $$
CREATE PROCEDURE sea_UpgradeScoreFactor(IN p_id INT)
	BEGIN
		UPDATE sea_upgrade SET score_factor = bonus_score + 1 WHERE id = p_id;
		SELECT score_factor AS res FROM sea_upgrade WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpgradeTimeFactor $$
CREATE PROCEDURE sea_UpgradeTimeFactor(IN p_id INT)
	BEGIN
		UPDATE sea_upgrade SET time_factor = time_factor + 1 WHERE id = p_id;
		SELECT time_factor AS res FROM sea_upgrade WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpgradeCooldownFactor $$
CREATE PROCEDURE sea_UpgradeCooldownFactor(IN p_id INT)
	BEGIN
		UPDATE sea_upgrade SET cooldown_factor = cooldown_factor + 1 WHERE id = p_id;
		SELECT cooldown_factor AS res FROM sea_upgrade WHERE id = p_id;
	END
$$

DELIMITER ;
