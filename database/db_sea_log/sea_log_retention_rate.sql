USE sea_log;

DROP TABLE IF EXISTS sea_retention_rate;

CREATE TABLE sea_log.sea_retention_rate(
	id INT NOT NULL AUTO_INCREMENT,
	w_date DATE NOT NULL,
	rr INT UNSIGNED NOT NULL,
	PRIMARY KEY (id, w_date)
)ENGINE=ARCHIVE
PARTITION BY RANGE (to_days(w_date)) (
	PARTITION p201306 VALUES LESS THAN (to_days('2013-07-01')),
	PARTITION p201307 VALUES LESS THAN (to_days('2013-08-01')),
	PARTITION p201308 VALUES LESS THAN (to_days('2013-09-01')),
	PARTITION p201309 VALUES LESS THAN (to_days('2013-10-01')),
	PARTITION p201310 VALUES LESS THAN (to_days('2013-11-01')),
	PARTITION p201311 VALUES LESS THAN (to_days('2013-12-01')),
	PARTITION p201312 VALUES LESS THAN (to_days('2014-01-01'))
);

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_AddRetentionRate $$
CREATE PROCEDURE sea_AddRetentionRate(IN p_rr INT UNSIGNED)
	BEGIN
		INSERT sea_retention_rate(w_date, rr)
		VALUES (CURDATE(), p_rr);

		SELECT LAST_INSERT_ID() AS res;
	END
$$

DELIMITER ;
