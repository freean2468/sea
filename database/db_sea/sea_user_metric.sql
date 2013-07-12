USE sea;

DROP TABLE IF EXISTS sea_user_metric;

CREATE TABLE sea.sea_user_metric(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	uv TINYINT NOT NULL,
	last_week_uv TINYINT NOT NULL,
	this_week_uv TINYINT NOT NULL,
	pu TINYINT NOT NULL,

	INDEX idx_user_metric_1 (id)
);

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_RetentionRate $$
CREATE PROCEDURE sea_RetentionRate()
	BEGIN
		DECLARE intersection int;
		DECLARE last int;

		SELECT COUNT(*) into last FROM sea.sea_user_metric WHERE last_week_uv = 1;
		SELECT COUNT(*) into intersection FROM sea.sea_user_metric WHERE last_week_uv = 1 AND this_week_uv = 1;

		SELECT (intersection / last) AS res;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateWeekly $$
CREATE PROCEDURE sea_UpdateWeekly(IN p_id INT)
	BEGIN
		UPDATE sea.sea_user_metric SET last_week_uv = 0;
		UPDATE sea.sea_user_metric SET last_week_uv = 1 WHERE this_week_uv = 1;
		UPDATE sea.sea_user_metric SET this_week_uv = 0;
	END
$$

DROP PROCEDURE IF EXISTS sea_LastUv $$
CREATE PROCEDURE sea_LastUv()
	BEGIN
		SELECT COUNT(*) AS res FROM sea_user_metric WHERE uv = 1;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateUvOn $$
CREATE PROCEDURE sea_UpdateUvOn(IN p_id INT)
	BEGIN
		UPDATE sea.sea_user_metric SET uv = 1, this_week_uv = 1 WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateUvOff $$
CREATE PROCEDURE sea_UpdateUvOff()
	BEGIN
		UPDATE sea.sea_user_metric SET uv = 0;
	END
$$

#####
## PayingUser(PU)
#####
DROP PROCEDURE IF EXISTS sea_UpdatePuOn $$
CREATE PROCEDURE sea_UpdatePuOn(IN p_id INT)
	BEGIN
		DECLARE user_pu TINYINT(1);

		SELECT pu INTO user_pu FROM sea_user_metric WHERE id = p_id;

		IF user_pu = 0 THEN
			UPDATE sea.sea_user_metric SET pu = 1 WHERE id = p_id;
		END IF;
	END
$$

DELIMITER ;
