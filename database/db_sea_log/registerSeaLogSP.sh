# cleanup

mysql -u root --password=xmongames < ./sea_account_login.sql
mysql -u root --password=xmongames < ./sea_pay_assistant.sql
mysql -u root --password=xmongames < ./sea_pay_character.sql
mysql -u root --password=xmongames < ./sea_pay_coin.sql
mysql -u root --password=xmongames < ./sea_pay_heart.sql
mysql -u root --password=xmongames < ./sea_pay_item.sql
mysql -u root --password=xmongames < ./sea_pay_money.sql
mysql -u root --password=xmongames < ./sea_user_register.sql
mysql -u root --password=xmongames < ./sea_user_unregister.sql
mysql -u root --password=xmongames < ./sea_user_play.sql

echo 'done.'
