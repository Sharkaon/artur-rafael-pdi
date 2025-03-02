// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld('electronAPI', {
  onFileSelected: (callback: (path: string) => void) => {
    ipcRenderer.on('file-selected', (event, filePath) => {
      callback(filePath); // Chama a função de callback com o caminho do arquivo
    });
  },
});