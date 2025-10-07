***Note: Before running this module, Node.js must be installed on your system. If it is not already installed, please download and install it from this link {https://nodejs.org/en}.
To check if Node.js is installed correctly and to verify its version, 
open a command prompt or terminal and type the following command:
		=> node -v


If you are working with Node.js for the first time:
		=> Run the nodeInitial.bat file by double-clicking on it.

		=> Setting up the IIS Settings for port rerouting
			=>> STEP-1 -> Install url rewrite -> https://www.iis.net/downloads/microsoft/url-rewrite
			=>> STEP-2 -> Install Application Request Routing -> https://www.iis.net/downloads/microsoft/application-request-routing
			=>> STEP-3 -> open IIS and Click on the server node (root) → double-click "Application Request Routing Cache"
							On the right-hand side, click Server Proxy Settings → check Enable proxy → Apply

***********************************************************************************************************************************************************************

To configure this module as External module, follow the below Steps:
===================================================================

1> First keep the published folder in this path -> C:\inetpub\wwwroot and Convert To Application


2> Run the _prj_start.bat {double Click on _prj_start.bat}


To stop the old module go to the path: C:\inetpub\wwwroot\prj_sr_afro_gate_entry\prj_sr_afro_Server in powershell as admin and run the command>> npm run delete
***********************************************************************************************************************************************************************


To run the SrAfro_GateEntry mobile app, follow the below Steps:
===================================================================

1> Install SrAfro_GateEntry-release.apk on the android mobile.

2> For Login into the SrAfro_GateEntry mobile app, provide the following Login credentials:
For example, if Focus is hosted on "http://172.16.1.189/focus8w#" and Company login details are:
	Username: su
	Password: su
	Company: SrAfro [0E0], then mobile app Login credentials are also the same, like below,

		Hostname: 172.16.1.189
		Username: su
		Password: su
		Company Code: srAfro [0E0]

**** For a registered user in "http://{ipAddress}/focus8w#", the user can be able to login.

**Note: Users should allow access to the "Camera" and "Microphone".
