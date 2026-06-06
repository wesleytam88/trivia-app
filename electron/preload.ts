import { contextBridge, ipcRenderer } from "electron";
import { AudienceState } from "../shared/game";

contextBridge.exposeInMainWorld('api', {
    selectQuestionFile: (): Promise<string | null> => 
        ipcRenderer.invoke('select-question-file'),

    selectMediaFolder: (): Promise<string | null> => 
        ipcRenderer.invoke('select-media-folder'),

    // Host -> Main -> Audience state relay
    sendAudienceState: (state: AudienceState): void =>
        ipcRenderer.send('audience-state', state),

    recvAudienceState: (callback: (state: AudienceState) => void): void => {
        ipcRenderer.on('audience-state', (_event, state) => callback(state));
    },
});
