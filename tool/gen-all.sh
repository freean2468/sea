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

node tweaking.js 'c2g' 'g2c'
echo 'c2g.cs and g2c.cs has been generated'

cd ${0%/*} 2>/dev/null
#echo $PWD/${0##*/}

#echo ${PWD}

# echo ${PWD}/$0

echo 'gen-all has done'
