***Note: Before running this module, Node.js must be installed on your system. If it is not already installed, please download and install it from this link {https://nodejs.org/en/download}.
To check if Node.js is installed correctly and to verify its version, 
open a command prompt or terminal and type the following command:
		=> node -v

step 1> Download and Install JDK17 {https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html}

step 2> Download and install Android Studio. {https://developer.android.com/studio}


step 3> setup for environment variables for ANDROID_HOME:
Configure the ANDROID_HOME environment variable
The React Native tools require some environment variables to be set up in order to build apps with native code.

Open the Windows Control Panel.
Click on User Accounts, then click User Accounts again
Click on Change my environment variables
Click on New... to create a new ANDROID_HOME user variable that points to the path to your Android SDK:

example:
--------
variable name: ANDROID_HOME
variable value: C:\Users\saikumar\AppData\Local\Android\Sdk

step 4> setup for environment variables for JAVA_HOME:

run the below commands to set environment java variables

setx JAVA_HOME "C:\Program Files\Java\jdk-17"
setx PATH "%PATH%;C:\Program Files\Java\jdk-17\bin"

=================================================================================

To run development app in physical device follow the below Steps:
(**note both system and mobile should connect to same network)
==================================================================

step 5> 
=> enable developer option in mobile
=> enable usb debugging and connect to system and click on allow for debug
=> and run command in terminal >> adb -s 1377223993001B0 connect 172.16.1.124:5555 
        to get our device id (1377223993001B0), run >> adb devices
        (172.16.1.124) is mobile connect ip
=> click on Allow

=> to check devices connect run >> adb devices

step 6> npm install in the path like example: {D:\01.saikumar\projects\prj_sr_afro\FocusOrderApp_0} 
(to install the packages from package.json)

step 7> to start application
run in the path like example: {D:\01.saikumar\projects\prj_sr_afro\FocusOrderApp_0} 
 >> npx react-native start --reset-cache

 and enter "a" to run code on android

 ======> now can make Changes in code, will reflect immediately, if not enter 'r' in terminal

 step 8> for app release
run in the path like example: {D:\01.saikumar\projects\prj_sr_afro\FocusOrderApp_0\android} 
>> ./gradlew assembleRelease

apk will generate in the path example:{D:\01.saikumar\projects\prj_sr_afro\FocusOrderApp_0\android\app\build\outputs\apk\release}



To run the FocusOrderApp mobile app, follow the below Steps:
===================================================================

1> Install FocusOrderApp-release.apk on the android mobile.

2> For Login into the FocusOrderApp mobile app, provide the following Login credentials:
For example, if Focus is hosted on "http://172.16.1.174/focus8w#" and Company login details are:
	Username: su
	Password: su
	Company: SR AFRO [060], 

then mobile app Login credentials are also the same, like below,

		Hostname: http://172.16.1.174
		Username: su
		Password: su
		Company: SR AFRO [060]

**Note: Users should allow access to the "Camera", "Microphone" and Storage.
**Note: Installing a new version? Always uninstall the old app first for best results.

