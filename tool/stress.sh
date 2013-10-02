#!/bin/bash
# Usage : bash stress.sh

echo "USAGE : bash stress.sh [IP] [PORT] [MAX_INDEX] [REPEAT]"

#let "req=$3*$4*10"

#pre=$(date +%s)

for ((b=0; b < $4; ++b))
do
	for ((a=0; a < $3; a++))
	do
		(node stress-client.js $a $1 $2) &
	done
done

#post=$(date +%s)
#let "took=$post-$pre"
#let "avg=$took/($3*$4)"

#echo "stress.sh has done."
#echo "10(req) per client, total: $req req"
#echo "overall working time : $took(s)"
#echo "avg response time per client : $avg(s)"

echo 'stress has done'
