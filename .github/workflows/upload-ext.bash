#!/bin/bash

set -e

token=`curl \
--silent \
--fail \
-H "Content-Type: application/json" \
-d '{
	"refresh_token": "'$1'",
	"client_id": "'$2'",
	"client_secret": "'$3'",
	"grant_type": "refresh_token"
}' \
-X POST \
-v https://www.googleapis.com/oauth2/v4/token \
| jq -r '.access_token'`

res=`curl \
--silent \
--show-error \
--fail \
-H "Authorization: Bearer $token" \
-H "x-goog-api-version: 2" \
-X PUT \
-T extension.zip \
-v https://www.googleapis.com/upload/chromewebstore/v1.1/items/icinedakgbcmhanlhfhckigdeefompfg`

echo $res | jq '.'

apiStatus=`echo $res | jq -r '.uploadState'`

if [[ "$apiStatus" == 'FAILURE' ]]
then
  exit 1
fi

exit 0