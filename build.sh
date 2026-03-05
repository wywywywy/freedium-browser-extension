#!/bin/bash
set -e

echo "Creating directories..."
mkdir -p temp firefox chrome

echo "Cleaning directories..."
rm -rf temp/* firefox/* chrome/*

echo "Copying Firefox files..."
cp *.js *.png *.html temp/
cp manifest-v2.json temp/manifest.json

echo "Creating freedium-browser-extension.xpi..."
zip -j firefox/freedium-browser-extension.xpi temp/*

echo "Copying Chrome files..."
cp *.js *.png *.html chrome/
cp manifest-v3-chrome.json chrome/manifest.json
cp manifest-v3-chrome.json temp/manifest.json

echo "Creating freedium-browser-extension.zip..."
zip -j chrome/freedium-browser-extension.zip temp/*

echo "Done!"
