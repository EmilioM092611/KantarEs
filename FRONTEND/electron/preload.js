const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al contexto del renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Información de la aplicación
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // Diálogos del sistema
    showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),

    // Eventos del menú
    onMenuAction: (callback) => ipcRenderer.on('menu-action', callback),
    removeMenuListener: () => ipcRenderer.removeAllListeners('menu-action'),

    // Información del sistema
    platform: process.platform,

    // Comunicación con el proceso principal
    send: (channel, data) => {
        // Whitelist de canales permitidos
        const validChannels = ['toMain', 'window-minimize', 'window-maximize', 'window-close'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },

    receive: (channel, func) => {
        const validChannels = ['fromMain', 'menu-action'];
        if (validChannels.includes(channel)) {
            // Eliminar listeners existentes para evitar duplicados
            ipcRenderer.removeAllListeners(channel);
            // Agregar el nuevo listener
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },

    // Utilidades específicas para tu aplicación
    restaurant: {
        // Aquí puedes agregar funciones específicas para el sistema de restaurante
        saveData: (data) => ipcRenderer.invoke('save-restaurant-data', data),
        loadData: () => ipcRenderer.invoke('load-restaurant-data'),
        exportReport: (reportData) => ipcRenderer.invoke('export-report', reportData),
    }
});

// Agregar información sobre si estamos en Electron
contextBridge.exposeInMainWorld('isElectron', true);

// Event listeners para debugging (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
    window.addEventListener('DOMContentLoaded', () => {
        console.log('Preload script loaded successfully');
        console.log('Platform:', process.platform);
        console.log('Electron APIs exposed:', Object.keys(window.electronAPI || {}));
    });
}