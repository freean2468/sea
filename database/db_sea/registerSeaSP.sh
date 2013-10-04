# cleanup

mysql -u root --password=xmongames < ./sea_user.sql
mysql -u root --password=xmongames < ./sea_user_black.sql
mysql -u root --password=xmongames < ./sea_user_info.sql
mysql -u root --password=xmongames < ./sea_item.sql
mysql -u root --password=xmongames < ./sea_user_log.sql
mysql -u root --password=xmongames < ./sea_metric.sql
mysql -u root --password=xmongames < ./sea_upgrade.sql
mysql -u root --password=xmongames < ./sea_baton.sql
mysql -u root --password=xmongames < ./sea_energy.sql
mysql -u root --password=xmongames < ./sea_baton_result.sql
mysql -u root --password=xmongames < ./sea_character_1.sql
mysql -u root --password=xmongames < ./sea_character_2.sql
mysql -u root --password=xmongames < ./sea_character_3.sql
mysql -u root --password=xmongames < ./sea_character_4.sql
mysql -u root --password=xmongames < ./sea_costume_head_1.sql
mysql -u root --password=xmongames < ./sea_costume_top_1.sql
mysql -u root --password=xmongames < ./sea_costume_bottoms_1.sql
mysql -u root --password=xmongames < ./sea_costume_back_1.sql
mysql -u root --password=xmongames < ./sea_ghost_1.sql
mysql -u root --password=xmongames < ./sea_ghost_2.sql
mysql -u root --password=xmongames < ./sea_ghost_house.sql

echo 'done.'
