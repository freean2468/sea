node protocolElementListGen.js
node protocolListGen.js

node jsProtocolElementGen.js
node csProtocolElementGen.js

node jsProtocolGen.js
node csProtocolGen.js

node protocolHandleGen.js game ver c2s r2g

cp -a gameProtocolHandle.js ../../testServer/protocolHandle.js
echo 'gameProtocolHandle.js has been copied to ../../testServer/ as protocolHandle.js'

node protocolHandlerGen.js
node protocolHandlerImplGen.js game ver c2s r2g
node protocolHandlerImplGen.js rank g2r

cp -a gameProtocolHandler_MySQL.js ../../testServer/protocolHandler_MySQL.js
echo 'gameProtocolHandler_MySQL has been copied to ../..testServer/ as protocolHandler_MySQL'
cp -a gameProtocolHandler_MongoDB.js ../../testServer/protocolHandler_MongoDB.js
echo 'gameProtocolHandler_MongoDB has been copied to ../../testServer/ as protocolHandler_MongoDB'

cp -a verProtocol.js ../../testServer/
cp -a c2sProtocol.js ../../testServer/
cp -a s2cProtocol.js ../../testServer/
cp -a r2gProtocol.js ../../testServer/
cp -a g2rProtocol.js ../../testServer/
echo 'verProtocol.js file has been copied to ../../testServer'
echo 'c2sProtocol.js file has been copied to ../../testServer'
echo 's2cProtocol.js file has been copied to ../../testServer'
echo 'r2gProtocol.js file has been copied to ../../testServer'
echo 'g2rProtocol.js file has been copied to ../../testServer'

cp -a protocolElement.js ../../testServer/
echo 'protocolElement.js file has been copied to ../../testServer/'

cp -a protocolHandler.js ../../testServer/
echo 'protocolHandler.js file has been copied to ../../testServer/'

cd ${0%/*} 2>/dev/null
#echo $PWD/${0##*/}

#echo ${PWD}

# echo ${PWD}/$0

echo 'done'
