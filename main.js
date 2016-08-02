'use strict';
const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const {ipcMain} = electron;
const {globalShortcut} = electron;

var mainWindow = null;

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        height: 700,
        width: 442,
        // width:1000,
        frame:false,
        resizable:false
    });

    mainWindow.loadURL('file://' + __dirname + '/app/index.html');
    // mainWindow.webContents.openDevTools();
});

ipcMain.on('close-main-window',function(){
    app.quit();
});

ipcMain.on('minimize-main-window',function(){
	mainWindow.minimize();
})