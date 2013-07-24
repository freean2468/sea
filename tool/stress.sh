#!/bin/bash
# Usage : bash stress.sh

echo "USAGE : bash stress.sh [MAX_INDEX] [REPEAT]"

for ((b=0; b < $2; ++b))
do
	for ((a=0; a < $1; a++))
	do
		node stressClient.js $a
	done
done

echo "stress.sh has done."

exit 0
