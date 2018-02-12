#!/bin/bash

mkdir zip
cp index.js zip/
cp newsletter.js zip/
cd zip
mkdir node_modules
npm install mailparser request cheerio turndown
zip -r ../post-newsletter.zip *
cd ../
rm -r zip/
