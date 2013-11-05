USE sea;

DROP TABLE IF EXISTS sea_user_black;

CREATE TABLE sea.sea_user_black(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	k_id VARCHAR(40) NOT NULL,

	INDEX idx_user_black_1 (k_id)
);

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_GetBlackCount $$
CREATE PROCEDURE sea_GetBlackCount()
	BEGIN
		SELECT COUNT(ID) AS res FROM sea_user_black;
	END
$$

DROP PROCEDURE IF EXISTS sea_RegisterBlack $$
CREATE PROCEDURE sea_RegisterBlack(IN p_k_id varchar(40) CHARACTER SET utf8)
	BEGIN
		INSERT sea_user_black(k_id) VALUES (p_k_id);
	END
$$

DROP PROCEDURE IF EXISTS sea_UnregisterBlack $$
CREATE PROCEDURE sea_UnregisterBlack(IN p_k_id varchar(40) CHARACTER SET utf8)
	BEGIN
		DELETE FROM sea_user_black WHERE k_id = p_k_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_IsBlack $$
CREATE PROCEDURE sea_IsBlack(IN p_k_id varchar(40) CHARACTER SET utf8)
	BEGIN
		DECLARE count TINYINT UNSIGNED;
		SELECT COUNT(k_id) INTO count FROM sea_user_black WHERE k_id = p_k_id;

		IF (0 < count) THEN
			SELECT 1 AS res;
		ELSE
			SELECT 0 AS res;
		END IF;
	END
$$

DELIMITER ;
