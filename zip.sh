#!/bin/bash

unset npm_config_prefix
source /usr/share/nvm/init-nvm.sh
nvm install 8.10
mkdir zip
cp package.json zip/
cp package-lock.json zip/
cp index.js zip/
cp newsletter.js zip/
cd zip
NODE_ENV=production npm install
rm ../post-newsletter.zip
zip -r ../post-newsletter.zip *
cp package-lock.json ../
cd ../
rm -r zip/
