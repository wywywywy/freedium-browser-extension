@ECHO OFF

ECHO Creating directories...
if not exist "%CD%\temp" mkdir "%CD%\temp"
if not exist "%CD%\firefox" mkdir "%CD%\firefox"
if not exist "%CD%\chrome" mkdir "%CD%\chrome"

ECHO Cleaning directories...
DEL /q temp\*.*
DEL /q firefox\*.*
DEL /q chrome\*.*

ECHO Copying Firefox files...
COPY /y *.js temp\
COPY /y *.png temp\
COPY /y *.html temp\
COPY /y manifest-v2.json temp\manifest.json

ECHO Creating freedium-browser-extension.xpi...
7z a -tzip firefox\freedium-browser-extension.xpi "%CD%\temp\*"

ECHO Copying Chrome files...
COPY /y *.js chrome\
COPY /y *.png chrome\
COPY /y *.html chrome\
COPY /y manifest-v3-chrome.json chrome\manifest.json
COPY /y manifest-v3-chrome.json temp\manifest.json

ECHO Creating freedium-browser-extension.zip...
7z a -tzip chrome\freedium-browser-extension.zip "%CD%\temp\*"

ECHO Done!