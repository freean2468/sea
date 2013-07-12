# cleanup

mysql -u root --password=xmongames < ./sea_user.sql
mysql -u root --password=xmongames < ./sea_user_black.sql
mysql -u root --password=xmongames < ./sea_user_info.sql
mysql -u root --password=xmongames < ./sea_user_assistants.sql
mysql -u root --password=xmongames < ./sea_user_items.sql
mysql -u root --password=xmongames < ./sea_user_characters.sql
mysql -u root --password=xmongames < ./sea_user_log.sql
mysql -u root --password=xmongames < ./sea_user_metric.sql
mysql -u root --password=xmongames < ./sea_user_upgrade.sql
mysql -u root --password=xmongames < ./sea_user_baton.sql
mysql -u root --password=xmongames < ./sea_user_honey.sql
mysql -u root --password=xmongames < ./sea_user_baton_result.sql

echo 'done.'
