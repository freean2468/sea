# cleanup

mysql -u root --password=xmongames < ./sea_log_account_login.sql
mysql -u root --password=xmongames < ./sea_log_concurrent_user.sql
mysql -u root --password=xmongames < ./sea_log_peak_concurrent_user.sql
mysql -u root --password=xmongames < ./sea_log_retention_rate.sql
mysql -u root --password=xmongames < ./sea_log_unique_visitor.sql
mysql -u root --password=xmongames < ./sea_log_pay_character.sql
mysql -u root --password=xmongames < ./sea_log_pay_coin.sql
mysql -u root --password=xmongames < ./sea_log_pay_energy.sql
mysql -u root --password=xmongames < ./sea_log_pay_item.sql
mysql -u root --password=xmongames < ./sea_log_pay_money.sql
mysql -u root --password=xmongames < ./sea_log_user_register.sql
mysql -u root --password=xmongames < ./sea_log_user_unregister.sql
mysql -u root --password=xmongames < ./sea_log_user_play.sql

echo 'done.'
