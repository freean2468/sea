node message-id-gen.js -proto 'g2c' 'c2g'

node proto-build-gen.js 'c2g' 'g2c' 'c2g'
cp -a c2g-proto-build.js ../server/sea_build.js
echo 'c2g-proto-build.js has been copied to ../server/sea_build.js'

node handle-gen.js 'c2g'

cp -a c2g-handle.js ../server/sea_handle.js
echo 'c2g-handle.js has been copied to ../server/sea_handle.js'

node tweaking.js 'c2g' 'g2c'
echo 'c2g.cs and g2c.cs has been generated'

cd ${0%/*} 2>/dev/null
#echo $PWD/${0##*/}

#echo ${PWD}

# echo ${PWD}/$0

echo 'gen-all has done'
