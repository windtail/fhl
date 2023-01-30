#!/bin/bash

# npm config set sharp_binary_host "https://npmmirror.com/mirrors/sharp"
# npm config set sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips"
# pnpm install cordova-res

cordova-res android --skip-config --copy

pushd resources/android/icon >/dev/null

cp drawable-mdpi-icon.png mdpi-foreground.png
cp drawable-hdpi-icon.png hdpi-foreground.png
cp drawable-xhdpi-icon.png xhdpi-foreground.png
cp drawable-xxhdpi-icon.png xxhdpi-foreground.png
cp drawable-xxxhdpi-icon.png xxxhdpi-foreground.png

popd >/dev/null

cordova-res android --skip-config --copy
