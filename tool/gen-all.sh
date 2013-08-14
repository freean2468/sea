node message-id-gen.js g2c c2g g2l

node proto-build-gen.js 'c2g' 'g2c' 'c2g' 'g2l'
cp -a c2g-proto-build.js ../gameServer/
echo 'c2g-proto-build.js has been copied to ../gameServer/'

node proto-build-gen.js 'g2l' 'g2l'
cp -a g2l-proto-build.js ../logServer/
echo 'g2l-proto-build.js has been copied to ../logServer'

node handle-gen.js 'c2g' 'g2l'

cp -a c2g-handle.js ../gameServer/
echo 'c2g-handle.js has been copied to ../gameServer'

cp -a g2l-handle.js ../logServer/
echo 'g2l-handle.js has been copied to ../logServer'

node handler-gen.js '-server' 'c2g' 'g2l' '-proto' 'c2g' 'g2c' 'g2l'

cp -a c2g-handler.js ../gameServer/
echo 'c2g-handler.js has been copied to ../gameServer'

cp -a g2l-handler.js ../logServer/
echo 'g2l-handler.js has been copied to ../logServer'

#node handler-impl-gen.js 'c2g'
#
#cp -a c2g-handler-mysql.js ../gameServer/c2g-handler-mysql.js
#cp -a c2g-handler-mongodb.js ../gameServer/c2g-handler-mongodb.js
#echo 'c2g-handler-mongodb and c2g-handler-mysql have been copied to ../gameServer/ as c2g-handler-mongodb and c2g-handler-mysql'
#
#node handler-impl-gen.js 'g2l'
#
#cp -a g2l-handler-mysql.js ../logServer/g2l-handler-mysql.js
#cp -a g2l-handler-mongodb.js ../logServer/g2l-handler-mongodb.js
#echo 'g2l-handler-mongodb and g2l-handler-mysql have been copied to ../logServer/ as g2l-handler-mongodb and g2l-handler-mysql'

cd ${0%/*} 2>/dev/null
#echo $PWD/${0##*/}

#echo ${PWD}

# echo ${PWD}/$0

echo 'gen-all has done'
