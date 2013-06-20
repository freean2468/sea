USE sea_log;

DROP TABLE IF EXISTS sea_pay_character;

CREATE TABLE sea_log.sea_pay_character(
	id INT NOT NULL AUTO_INCREMENT,
	k_id VARCHAR(40) NOT NULL,
	w_date DATE NOT NULL,
	w_time TIME NOT NULL,
	paid_character SMALLINT NOT NULL,
	rest_coin MEDIUMINT NOT NULL,
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

DROP PROCEDURE IF EXISTS sea_AddLogPayCharacter $$
CREATE PROCEDURE sea_AddLogPayCharacter(IN p_k_id VARCHAR (40) CHARACTER SET utf8, IN p_paid_character SMALLINT, IN p_rest_coin MEDIUMINT)
	BEGIN
		INSERT sea_pay_character(k_id, w_date, w_time, paid_character, rest_coin)
		VALUES (p_k_id, CURDATE(), CURTIME(), p_paid_character, p_rest_coin);

		SELECT LAST_INSERT_ID() AS res;
	END
$$

DELIMITER ;
