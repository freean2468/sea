#!/bin/bash
# Usage : bash stress.sh

echo "USAGE : bash stress.sh [MAX_INDEX] [REPEAT]"

#let "req=$1*$2*10"

#pre=$(date +%s)

for ((b=0; b < $2; ++b))
do
	for ((a=0; a < $1; a++))
	do
		(node stressClient.js $a) &
	done
done

#post=$(date +%s)
#let "took=$post-$pre"
#let "avg=$took/($1*$2)"

#echo "stress.sh has done."
#echo "10(req) per client, total: $req req"
#echo "overall working time : $took(s)"
#echo "avg response time per client : $avg(s)"

exit 0
