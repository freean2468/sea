USE sea_log;

DROP TABLE IF EXISTS sea_concurrent_user;

CREATE TABLE sea_log.sea_concurrent_user(
	id INT NOT NULL AUTO_INCREMENT,
	w_date DATE NOT NULL,
	w_time TIME NOT NULL,
	ccu INT UNSIGNED NOT NULL,
	PRIMARY KEY (id, w_date)
)ENGINE=MyISAM
PARTITION BY RANGE COLUMNS (w_date) (
	PARTITION p201308 VALUES LESS THAN ('2013-09-01'),
	PARTITION p201309 VALUES LESS THAN ('2013-10-01'),
	PARTITION p201310 VALUES LESS THAN ('2013-11-01'),
	PARTITION p201311 VALUES LESS THAN ('2013-12-01'),
	PARTITION p201312 VALUES LESS THAN ('2014-01-01'),
	PARTITION pMAX VALUES LESS THAN (MAXVALUE)
);

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_AddConcurrentUser $$
CREATE PROCEDURE sea_AddConcurrentUser(IN p_ccu INT UNSIGNED)
	BEGIN
		INSERT sea_concurrent_user(w_date, w_time, ccu)
		VALUES (CURDATE(), CURTIME(), p_ccu);

		SELECT LAST_INSERT_ID() AS res;
	END
$$

DROP PROCEDURE IF EXISTS sea_PeakConcurrentUser $$
CREATE PROCEDURE sea_PeakConcurrentUser()
	BEGIN
		SELECT MAX(ccu) AS res FROM sea_log.sea_concurrent_user WHERE w_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY);
	END
$$

DELIMITER ;
