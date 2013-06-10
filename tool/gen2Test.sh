node messageIdGen.js ver s2c c2s

node protoBuildGen.js ver s2c c2s
cp -a protoBuild.js ../testServer/
echo 'protoBuild.js has been copied to ../testServer/'

node handleGen.js 'ver' 'c2s' 's2c'

cp -a handle.js ../testServer/
echo 'handle.js has been copied to ../testServer/'

node handlerGen.js 'ver' 'c2s' 's2c'
node handlerImplGen.js 'test' 'ver' 'c2s'

cp -a testHandler_MySQL.js ../testServer/handler_MySQL.js
cp -a testHandler_MongoDB.js ../testServer/handler_MongoDB.js
echo 'testHandler_MongoDB and testHandler_MySQL have been copied to ../testServer/ as handler_MongoDB and handler_MySQL'

cp -a c2s.proto ../testServer/
cp -a s2c.proto ../testServer/
cp -a ver.proto ../testServer/
echo 's2c.proto s2c.proto and ver.proto have been copied to ../testServer'

cp -a handle.js ../testServer/
cp -a handler.js ../testServer/
echo 'handle.js and handler.js have been copied to ../testServer'

cp -a c2sHandle.js ../testServer/
cp -a s2cHandle.js ../testServer/
cp -a verHandle.js ../testServer/
echo 'perspective *Handle.js files have been copied to ../testServr'

cd ${0%/*} 2>/dev/null
#echo $PWD/${0##*/}

#echo ${PWD}

# echo ${PWD}/$0

echo 'done'
