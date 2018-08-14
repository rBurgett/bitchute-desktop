# bitchute-desktop
Unofficial [BitChute](https://www.bitchute.com/) desktop application.

![BitChute Desktop screenshot](https://s3.amazonaws.com/com.ryanburgett.personal/Screen+Shot+2018-08-14+at+2.30.43+PM.png)

## Installation
Installers for Windows, macOS, and Linux can be found in our [Releases](https://github.com/rBurgett/bitchute-desktop/releases).

*Note: The Linux installer is an [AppImage](https://appimage.org/). In order to use an AppImage file, the user will first need to set the installer file (e.g. `bitchute-desktop-0.1.0-x86_64.AppImage`) to allow execution as an application. Then, when they run it the application will be installed and opened.*

## Updates
If the user downloads and installs using our installers, the application will be automatically updated quietyly in the background as they use it in order to keep it up to date and provide them with the latest features.

## Usage
Go to your favorite BitChute channel. Find the channel name in the URL bar.
![Channel URL screenshot](https://s3.amazonaws.com/com.ryanburgett.personal/Screen+Shot+2018-08-14+at+2.38.28+PM.png)

In BitChute Desktop, click the plus button on the sidebar, enter the channel name, and then click OK.
![Channel name entry screenshot](https://s3.amazonaws.com/com.ryanburgett.personal/Screen+Shot+2018-08-14+at+2.41.22+PM.png)

Once the channel is added, you will see how many unwatched videos you have. You can then click in to each channel to watch videos and mark them as watched or unwached as needed. Channels can be removed by right-clicking the channel on the sidebar. More options are available for individual videos by right-clicking on them.

## Starting the application in development mode
1. Clone the project
2. `npm install`
3. `npm run build`
4. `npm start`

## NPM Scripts
* `start` - starts the application in development mode
* `build` - transpiles the code in `./src`
* `watch` - watchs the code in `./src` and transpiles on any changes

## Contributions
Contributions are welcome! If you have any issues and/or contributions you would like to make, feel free to file an issue and/or issue a pull request.

## License
Apache License Version 2.0

Copyright (c) 2018 by Ryan Burgett.
