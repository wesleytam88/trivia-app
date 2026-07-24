import { contextBridge, ipcRenderer } from "electron";
import { AudienceState } from "../shared/game";
import { ParseResult, Board } from "../shared/board";

contextBridge.exposeInMainWorld('api', {
    selectQuestionFile: (): Promise<string | null> => 
        ipcRenderer.invoke('select-question-file'),

    selectMediaFolder: (): Promise<string | null> => 
        ipcRenderer.invoke('select-media-folder'),

    parseQuestionFile: (filePath: string): Promise<ParseResult> => 
        ipcRenderer.invoke('parse-question-file', (filePath)),

    validateMediaFiles: (boards: Board[], mediaFolder: string): Promise<string[]> =>
        ipcRenderer.invoke('validate-media-files', boards, mediaFolder),

    getMediaPort: (): Promise<number | null> =>
        ipcRenderer.invoke('get-media-port'),

    // Host -> Main -> Audience state relay
    sendAudienceState: (state: AudienceState): void =>
        ipcRenderer.send('audience-state', state),

    recvAudienceState: (callback: (state: AudienceState) => void): void => {
        ipcRenderer.on('audience-state', (_event, state) => callback(state));
    },

    // Host -> Main -> Audience pause/resume relay
    sendAudiencePause: (paused: boolean): void => 
        ipcRenderer.send('audience-pause', paused),

    recvAudiencePause: (callback: (paused: boolean) => void): void => {
        ipcRenderer.on('audience-pause', (_event, paused) => callback(paused));
    },

    offAudiencePause: (): void => {
        ipcRenderer.removeAllListeners('audience-pause');
    },

    // Host -> Main -> Audience buzz-in relay
    // buttonId = string shows overlay, null clears it and resumes
    sendAudienceBuzzIn: (playerName: string | null): void => 
        ipcRenderer.send('audience-buzzin', playerName),

    recvAudienceBuzzIn: (callback: (playerName: string | null) => void): void => {
        ipcRenderer.on('audience-buzzin', (_event, playerName) => callback(playerName));
    },

    offAudienceBuzzIn: (): void => {
        ipcRenderer.removeAllListeners('audience-buzzin');
    },
});
