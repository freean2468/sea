node messageIdGen.js ver s2c c2s

node protoBuildGen.js ver s2c c2s
cp -a protoBuild.js ../gameServer/
echo 'protoBuild.js has been copied to ../gameServer/'

node handleGen.js 'ver' 'c2s' 's2c'

cp -a handle.js ../gameServer/
echo 'handle.js has been copied to ../gameServer/'

node handlerGen.js 'ver' 'c2s' 's2c'
node handlerImplGen.js 'test' 'ver' 'c2s'

cp -a testHandler_MySQL.js ../gameServer/handler_MySQL.js
cp -a testHandler_MongoDB.js ../gameServer/handler_MongoDB.js
echo 'testHandler_MongoDB and testHandler_MySQL have been copied to ../gameServer/ as handler_MongoDB and handler_MySQL'

cp -a c2s.proto ../gameServer/
cp -a s2c.proto ../gameServer/
cp -a ver.proto ../gameServer/
echo 'all of proto files have been copied to ../gameServer'

cp -a handle.js ../gameServer/
cp -a handler.js ../gameServer/
echo 'handle.js and handler.js have been copied to ../gameServer'

cp -a c2sHandle.js ../gameServer/
cp -a s2cHandle.js ../gameServer/
cp -a verHandle.js ../gameServer/
echo 'perspective *Handle.js files have been copied to ../gameServer'

cd ${0%/*} 2>/dev/null
#echo $PWD/${0##*/}

#echo ${PWD}

# echo ${PWD}/$0

echo 'done'
