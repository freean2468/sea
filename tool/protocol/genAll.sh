node protocolElementListGen.js
node protocolListGen.js

node jsProtocolElementGen.js
node csProtocolElementGen.js

node jsProtocolGen.js
node csProtocolGen.js

node protocolHandleGen.js game ver c2s r2g
node protocolHandleGen.js rank g2r

cp -a gameProtocolHandle.js ../../gameServer/protocolHandle.js
echo 'gameProtocolHandle.js has been copied to ../../gameServer/ as protocolHandle.js'
cp -a rankProtocolHandle.js ../../rankServer/protocolHandle.js
echo 'rankProtocolHandle.js has been copied to ../../rankServer/ as protocolHandle.js'

node protocolHandlerGen.js
node protocolHandlerImplGen.js game ver c2s r2g
node protocolHandlerImplGen.js rank g2r

cp -a gameProtocolHandler_MySQL.js ../../gameServer/protocolHandler_MySQL.js
echo 'gameProtocolHandler_MySQL has been copied to ../../gameServer/ as protocolHandler_MySQL'
cp -a gameProtocolHandler_MongoDB.js ../../gameServer/protocolHandler_MongoDB.js
echo 'gameProtocolHandler_MongoDB has been copied to ../../gameServer/ as protocolHandler_MongoDB'

cp -a rankProtocolHandler_MySQL.js ../../rankServer/protocolHandler_MySQL.js
echo 'rankProtocolHandler_MySQL has been copied to ../../rankServer/ as protocolHandler_MySQL'
cp -a rankProtocolHandler_MongoDB.js ../../rankServer/protocolHandler_MongoDB.js
echo 'rankProtocolHandler_MongoDB has been copied to ../../rankServer/ as protocolHandler_MongoDB'

cp -a verProtocol.js ../../gameServer/
cp -a c2sProtocol.js ../../gameServer/
cp -a s2cProtocol.js ../../gameServer/
cp -a r2gProtocol.js ../../gameServer/
cp -a g2rProtocol.js ../../gameServer/
echo 'verProtocol.js file has been copied to ../../gameServer'
echo 'c2sProtocol.js file has been copied to ../../gameServer'
echo 's2cProtocol.js file has been copied to ../../gameServer'
echo 'r2gProtocol.js file has been copied to ../../gameServer'
echo 'g2rProtocol.js file has been copied to ../../gameServer'

cp -a verProtocol.js ../../rankServer/
cp -a c2sProtocol.js ../../rankServer/
cp -a s2cProtocol.js ../../rankServer/
cp -a r2gProtocol.js ../../rankServer/
cp -a g2rProtocol.js ../../rankServer/
echo 'verProtocol.js file has been copied to ../../rankServer'
echo 'c2sProtocol.js file has been copied to ../../rankServer'
echo 's2cProtocol.js file has been copied to ../../rankServer'
echo 'r2gProtocol.js file has been copied to ../../rankServer'
echo 'g2rProtocol.js file has been copied to ../../rankServer'

cp -a protocolElement.js ../../gameServer/
echo 'protocolElement.js file has been copied to ../../gameServer/'
cp -a protocolElement.js ../../rankServer/
echo 'protocolElement.js file has been copied to ../../rankServer/'

cp -a protocolHandler.js ../../gameServer/
echo 'protocolHandler.js file has been copied to ../../gameServer/'
cp -a protocolHandler.js ../../rankServer/
echo 'protocolHandler.js file has been copied to ../../rankServer/'

cd ${0%/*} 2>/dev/null
#echo $PWD/${0##*/}

#echo ${PWD}

# echo ${PWD}/$0

echo 'done'
