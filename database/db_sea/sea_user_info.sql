USE sea;

DROP TABLE IF EXISTS sea_user_info;

CREATE TABLE sea.sea_user_info(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	coin MEDIUMINT UNSIGNED NOT NULL,
	money MEDIUMINT UNSIGNED NOT NULL,
	lv TINYINT UNSIGNED NOT NULL,
	exp MEDIUMINT UNSIGNED NOT NULL,
	point TINYINT UNSIGNED NOT NULL,
	energy TINYINT UNSIGNED NOT NULL,
	last_charged_time BIGINT UNSIGNED NOT NULL,
	selected_character TINYINT UNSIGNED NOT NULL,
	invite_count SMALLINT UNSIGNED NOT NULL,
	mileage TINYINT UNSIGNED UNSIGNED NOT NULL,
	draw SMALLINT UNSIGNED NOT NULL,

	INDEX idx_user_info_1 (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER $$

DROP PROCEDURE IF EXISTS sea_LoadUserInfo $$
CREATE PROCEDURE sea_LoadUserInfo(IN p_id INT)
	BEGIN
		SELECT I.coin, I.money, I.lv, I.exp, I.point, I.energy, I.last_charged_time, I.selected_character, I.invite_count, I.mileage, I.draw,
				IT.shield, IT.item_last, IT.ghost, IT.weapon_reinforce, IT.exp_boost, IT.max_attack, IT.bonus_heart, IT.drop_up, IT.magnet, IT.bonus_score,
				M.uv, 
				UG.score_factor, UG.time_factor, UG.cooldown_factor,
				C1.lv AS _1, C2.lv AS _2, C3.lv AS _3, C4.lv AS _4
		FROM sea.sea_user_info AS I
		INNER JOIN sea.sea_items AS IT ON p_id = IT.id
		INNER JOIN sea.sea_metric AS M ON p_id = M.id
		INNER JOIN sea.sea_upgrade AS UG ON p_id = UG.id
		INNER JOIN sea.sea_character_1 AS C1 ON p_id = C1.id
		INNER JOIN sea.sea_character_2 AS C2 ON p_id = C2.id
		INNER JOIN sea.sea_character_3 AS C3 ON p_id = C3.id
		INNER JOIN sea.sea_character_4 AS C4 ON p_id = C4.id
		WHERE I.id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadEnergy $$
CREATE PROCEDURE sea_LoadEnergy(IN p_id INT)
	BEGIN
		SELECT energy AS res FROM sea.sea_user_info WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadCoin $$
CREATE PROCEDURE sea_LoadCoin(IN p_id INT)
	BEGIN
		SELECT coin FROM sea.sea_user_info WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadMoney $$
CREATE PROCEDURE sea_LoadMoney(IN p_id INT)
	BEGIN
		SELECT money FROM sea.sea_user_info WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadDraw $$
CREATE PROCEDURE sea_LoadDraw(IN p_id INT)
	BEGIN
		SELECT draw FROM sea.sea_user_info WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadInviteCountWithMileageAndDraw $$
CREATE PROCEDURE sea_LoadInviteCountWithMileageAndDraw(IN p_id INT)
	BEGIN
		SELECT invite_count, mileage, draw AS res FROM sea.sea_user_info WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadMileageAndDraw $$
CREATE PROCEDURE sea_LoadMileageAndDraw(IN p_id INT)
	BEGIN
		SELECT mileage, draw FROM sea.sea_user_info WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_LoadUserBriefInfo $$
CREATE PROCEDURE sea_LoadUserBriefInfo(IN p_id INT)
	BEGIN
		SELECT coin, money, lv, exp, mileage, draw FROM sea.sea_user_info WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_CheckInCharge $$
CREATE PROCEDURE sea_CheckInCharge(IN p_id INT)
	BEGIN
		SELECT last_charged_time, energy FROM sea.sea_user_info WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_StartGame $$
CREATE PROCEDURE sea_StartGame(IN p_id INT)
	BEGIN
		SELECT selected_character, energy, last_charged_time
		FROM sea.sea_user_info
		WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateLevel $$
CREATE PROCEDURE sea_UpdateLevel(IN p_id INT, IN p_lv TINYINT UNSIGNED, IN p_exp MEDIUMINT UNSIGNED)
	BEGIN
		UPDATE sea_user_info SET lv = p_lv, exp = p_exp WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateCoin $$
CREATE PROCEDURE sea_UpdateCoin(IN p_id INT, IN p_coin MEDIUMINT UNSIGNED)
	BEGIN
		UPDATE sea_user_info SET coin = p_coin WHERE id = p_id;		
	END
$$

DROP PROCEDURE IF EXISTS sea_AddCoin $$
CREATE PROCEDURE sea_AddCoin(IN p_id INT, IN p_amount MEDIUMINT)
	BEGIN
		UPDATE sea_user_info SET coin = coin + p_amount WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateMoney $$
CREATE PROCEDURE sea_UpdateMoney(IN p_id INT, IN p_money MEDIUMINT UNSIGNED)
	BEGIN
		UPDATE sea_user_info SET money = p_money WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdatePoint $$
CREATE PROCEDURE sea_UpdatePoint(IN p_id INT, IN p_point TINYINT UNSIGNED)
	BEGIN
		UPDATE sea_user_info SET point = p_point WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateEnergy $$
CREATE PROCEDURE sea_UpdateEnergy(IN p_id INT, IN p_energy SMALLINT UNSIGNED)
	BEGIN
		UPDATE sea_user_info SET energy = p_energy WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateLastChargeTime $$
CREATE PROCEDURE sea_UpdateLastChargeTime(IN p_id INT, IN p_updated_charged_time BIGINT UNSIGNED)
	BEGIN
		UPDATE sea_user_info SET last_charged_time = p_updated_charged_time WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateSelectedCharacter $$
CREATE PROCEDURE sea_UpdateSelectedCharacter(IN p_id INT, IN p_selected TINYINT UNSIGNED)
	BEGIN
		UPDATE sea_user_info SET selected_character = p_selected WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateInviteCount $$
CREATE PROCEDURE sea_UpdateInviteCount(IN p_id INT, IN p_invite_count TINYINT UNSIGNED)
	BEGIN
		UPDATE sea_user_info SET invite_count = p_invite_count WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateMileage $$
CREATE PROCEDURE sea_UpdateMileage(IN p_id INT, IN p_mileage TINYINT UNSIGNED)
	BEGIN
		UPDATE sea_user_info SET mileage = p_mileage WHERE id = p_id;
	END
$$

DROP PROCEDURE IF EXISTS sea_UpdateDraw $$
CREATE PROCEDURE sea_UpdateDraw(IN p_id INT, IN p_draw TINYINT UNSIGNED)
	BEGIN
		UPDATE sea_user_info SET draw = p_draw WHERE id = p_id;
	END
$$



DELIMITER ;
