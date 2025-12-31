@echo off
echo Building for Chrome...
if not exist chrome_build mkdir chrome_build
xcopy src\_locales chrome_build\_locales /I /Y /E
xcopy src\background chrome_build\background /I /Y
xcopy src\icons chrome_build\icons /I /Y
xcopy src\lib chrome_build\lib /I /Y
xcopy src\newtab chrome_build\newtab /I /Y
xcopy src\options chrome_build\options /I /Y
xcopy src\popup chrome_build\popup /I /Y
xcopy src\report chrome_build\report /I /Y
copy src\manifest.json chrome_build\manifest.json

echo.
echo Building for Firefox...
if not exist firefox_build mkdir firefox_build
xcopy src\_locales firefox_build\_locales /I /Y /E
xcopy src\background firefox_build\background /I /Y
xcopy src\icons firefox_build\icons /I /Y
xcopy src\lib firefox_build\lib /I /Y
xcopy src\newtab firefox_build\newtab /I /Y
xcopy src\options firefox_build\options /I /Y
xcopy src\popup firefox_build\popup /I /Y
xcopy src\report firefox_build\report /I /Y
copy src\manifest-firefox.json firefox_build\manifest.json

echo.
echo Build Complete!

