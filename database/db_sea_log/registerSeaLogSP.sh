# cleanup

mysql -u root --password=xmongames < ./sea_log_account_login.sql
mysql -u root --password=xmongames < ./sea_log_concurrent_user.sql
mysql -u root --password=xmongames < ./sea_log_pay_assistant.sql
mysql -u root --password=xmongames < ./sea_log_pay_character.sql
mysql -u root --password=xmongames < ./sea_log_pay_coin.sql
mysql -u root --password=xmongames < ./sea_log_pay_heart.sql
mysql -u root --password=xmongames < ./sea_log_pay_item.sql
mysql -u root --password=xmongames < ./sea_log_pay_money.sql
mysql -u root --password=xmongames < ./sea_log_user_register.sql
mysql -u root --password=xmongames < ./sea_log_user_unregister.sql
mysql -u root --password=xmongames < ./sea_log_user_play.sql

echo 'done.'
