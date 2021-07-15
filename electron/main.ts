import {
	app,
	BrowserWindow,
	ipcMain,
	Menu,
	Tray,
	nativeImage,
	Notification,
} from 'electron';
import AutoLaunch from 'auto-launch';
import path from 'path';

let mainWindow: BrowserWindow | null;
let tray: Tray | null = null;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// const assetsPath =
//   process.env.NODE_ENV === 'production'
//     ? process.resourcesPath
//     : app.getAppPath()

const gotTheLock = app.requestSingleInstanceLock(); // Force app to only allow single instance

function showNotification() {
	new Notification({
		title: 'PlugMarket Desktop Client',
		body: 'O aplicativo está em execução.',
		icon: path.join(process.resourcesPath, 'assets/favicon.png'),
	}).show();
}

function createTray() {
	const icon = path.join(process.resourcesPath, 'assets/favicon.png');
	tray = new Tray(nativeImage.createFromPath(icon));
	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Show App',
			click: () => {
				createWindow();
			},
		},
		{
			label: 'Quit',
			click: () => {
				app.quit(); // actually quit the app.
			},
		},
	]);

	tray.setContextMenu(contextMenu);
	tray.setToolTip('PlugMarket Desktop Client');
	tray.setTitle('PlugMarket Desktop Client');

	showNotification();
}

function createWindow() {
	// Verify if window is already created
	if (!mainWindow) {
		// If false, create a new one
		mainWindow = new BrowserWindow({
			icon: path.join(process.resourcesPath, 'assets/favicon.png'),
			width: 800,
			height: 600,
			webPreferences: {
				nodeIntegration: false,
				contextIsolation: true,
				preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
			},
		});

		mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

		// Remove the menu bar
		mainWindow.removeMenu();

		// Maximize the window after opened
		// mainWindow.maximize();

		// Open developer tools
		// mainWindow.webContents.openDevTools();

		mainWindow.on('closed', () => {
			mainWindow = null;
		});
	} else {
		// If true, restore and focus
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.focus();
	}
}

async function registerListeners() {
	/**
	 * This comes from bridge integration, check bridge.ts
	 */
	ipcMain.on('message', (_, message) => {
		console.log(message);
	});
}

// Check if OS is Windows and set AppUserModelId as AppId in package.json -> build -> win
// This is required in order to show the application name in Windows 10 notifications instead of electron.app.ProductName
if (process.platform === 'win32') {
	app.setAppUserModelId('AuthorName.YourAppName.App.v1');
}

// Set app to run at OS startup
const autoLaunch = new AutoLaunch({
	name: 'PlugMarket Desktop Client'
});
autoLaunch.isEnabled().then(isEnabled => {
	if (isEnabled) {
		return;
	}
	autoLaunch.enable();
});

// Check if app allow multiple instances
if (!gotTheLock) {
	app.quit();
} else {
	// If it only allow a single instance

	// Actions when a second instance of the app is opened
	app.on('second-instance', () => {
		createWindow();
	});

	// Action when the first instance is opened
	app
		.on('ready', () => {
			createTray();
		})
		.whenReady()
		.then(() => {
			registerListeners();
		})
		.catch(e => console.error(e));
}

// Only MacOS
// Hide app in dock when all windows are closed
app.on('window-all-closed', () => {
	if (process.platform === 'darwin') {
		app.dock.hide();
	}
});

// If there are no windows opened, create a new one
app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
