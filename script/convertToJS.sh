#!/bin/bash

echo -e "const wordlist = [" > wordlist.js

input="wordlist.txt"
while IFS= read -r line
do
  echo -e "\t\"$line\"," >> wordlist.js 
done < "$input"

echo "];" >> wordlist.js