node messageIdGen.js ver s2c c2s g2l

node protoBuildGen.js game ver s2c c2s g2l
cp -a gameProtoBuild.js ../gameServer/protoBuild.js

node protoBuildGen.js log g2l
cp -a logProtoBuild.js ../logServer/protoBuild.js
echo 'gameProtoBuild.js and logProtoBuild.js have been copied to ../gameServer/ and ../logServer as protoBuild.js'

node handleGen.js 'ver' 'c2s' 's2c' 'g2l'

cp -a handle.js ../gameServer/
cp -a handle.js ../logServer/
echo 'handle.js has been copied to ../gameServer/ and ../logServer'

node handlerGen.js 'ver' 'c2s' 's2c' 'g2l'
node handlerImplGen.js 'game' 'ver' 'c2s' '-request' '-session'

cp -a gameHandler_MySQL.js gameHandler_MySQL.js.bak
cp -a gameHandler_MySQL.js ../gameServer/handler_MySQL.js
cp -a gameHandler_MongoDB.js gameHandler_MongoDB.js.bak
cp -a gameHandler_MongoDB.js ../gameServer/handler_MongoDB.js
echo 'gameHandler_MongoDB and gameHandler_MySQL have been copied to ../gameServer/ as handler_MongoDB and handler_MySQL'

node handlerImplGen.js 'log' 'g2l'

cp -a logHandler_MySQL.js logHandler_MySQL.js.bak
cp -a logHandler_MySQL.js ../logServer/handler_MySQL.js
cp -a logHandler_MongoDB.js logHandler_MySQL.js.bak
cp -a logHandler_MongoDB.js ../logServer/handler_MongoDB.js
echo 'logHandler_MongoDB and logHandler_MySQL have been copied to ../logServer/ as handler_MongoDB and handler_MySQL'

cp -a c2s.proto ../gameServer/
cp -a s2c.proto ../gameServer/
cp -a ver.proto ../gameServer/
cp -a g2l.proto ../gameServer
echo 'c2s, s2c, ver and g2l proto files have been copied to ../gameServer'

cp -a g2l.proto ../logServer/
echo 'g2l file has been copied to ../logServer'

cp -a handler.js ../gameServer/
cp -a handler.js ../logServer/
echo 'handler.js has been copied to ../gameServer and ../logServer'

cp -a c2sHandle.js ../gameServer/
cp -a s2cHandle.js ../gameServer/
cp -a verHandle.js ../gameServer/
echo 'c2sHandle.js, s2cHandle.js and verHandler.js files have been copied to ../gameServer'

cp -a g2lHandle.js ../logServer/
echo 'g2lHandle.js has been copied to ../logServer'

cp -a util.js ../gameServer/
cp -a util.js ../logServer/
echo 'util.js has been copied to ../gameServer and ../logServer'

cd ${0%/*} 2>/dev/null
#echo $PWD/${0##*/}

#echo ${PWD}

# echo ${PWD}/$0

echo 'done'
