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

    // Host -> Main -> Audience state relay
    sendAudienceState: (state: AudienceState): void =>
        ipcRenderer.send('audience-state', state),

    recvAudienceState: (callback: (state: AudienceState) => void): void => {
        ipcRenderer.on('audience-state', (_event, state) => callback(state));
    },
});
