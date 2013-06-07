# cleanup

mysql -u root --password=xmongames < ./sea_user.sql
mysql -u root --password=xmongames < ./sea_user_info.sql
mysql -u root --password=xmongames < ./sea_user_assistants.sql
mysql -u root --password=xmongames < ./sea_user_items.sql
mysql -u root --password=xmongames < ./sea_user_characters.sql
mysql -u root --password=xmongames < ./sea_user_log.sql

echo 'done.'
