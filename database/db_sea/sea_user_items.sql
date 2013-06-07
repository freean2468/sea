USE sea;

########################
##
########################
DROP TABLE IF EXISTS sea_user_items;

CREATE TABLE sea.sea_user_items(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	items SMALLINT NOT NULL,
	count TINYINT NOT NULL,

	INDEX idx_user_items_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$
DROP PROCEDURE IF EXISTS sea_AddUserItem $$
CREATE PROCEDURE sea_AddUserItem(IN p_id INT, IN p_count SMALLINT)
	BEGIN
		UPDATE sea_user_items SET count = count + p_count WHERE id = p_id;
	END
$$

DELIMITER ;
