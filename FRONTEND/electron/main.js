const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev'); // Usar la librería que instalamos

// Variables globales
let mainWindow;

function createWindow() {
    // Crear la ventana principal
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
        },
        show: false,
        icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
        titleBarStyle: 'default',
    });

    // URL según el entorno - CORREGIDO
    const startUrl = isDev
        ? 'http://localhost:3002' // Servidor de desarrollo
        : `file://${path.join(__dirname, '../out/index.html')}`; // Archivo estático

    console.log('isDev:', isDev);
    console.log('Loading URL:', startUrl);
    console.log('Icon path:', path.join(__dirname, 'assets/icon.png'));

    mainWindow.loadURL(startUrl);

    // Mostrar ventana cuando esté lista
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();

        // Abrir DevTools solo en desarrollo
        /*if (isDev) {
            mainWindow.webContents.openDevTools();
        }*/
    });

    // Manejar el cierre de ventana
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Manejar enlaces externos
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        require('electron').shell.openExternal(url);
        return { action: 'deny' };
    });

    // Debug: Manejar errores de carga
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('Failed to load:', validatedURL, errorDescription);
    });
}

// Configurar menú de la aplicación
function createMenu() {
    const template = [
        {
            label: 'Archivo',
            submenu: [
                {
                    label: 'Recargar',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Salir',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Ver',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Eventos de la aplicación
app.whenReady().then(() => {
    createWindow();
    createMenu();

    // Para macOS - recrear ventana cuando se active la app
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Salir cuando todas las ventanas estén cerradas (excepto en macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers para comunicación con el renderer
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
    const { dialog } = require('electron');
    const result = await dialog.showMessageBox(mainWindow, options);
    return result;
});