import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('api', {
    selectQuestionFile: (): Promise<string | null> => 
        ipcRenderer.invoke('select-question-file'),

    selectMediaFolder: (): Promise<string | null> => 
        ipcRenderer.invoke('select-media-folder')
});
