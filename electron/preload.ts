import { contextBridge, ipcRenderer } from "electron";
import { GameState } from "../shared/game";

contextBridge.exposeInMainWorld('api', {
    selectQuestionFile: (): Promise<string | null> => 
        ipcRenderer.invoke('select-question-file'),

    selectMediaFolder: (): Promise<string | null> => 
        ipcRenderer.invoke('select-media-folder'),

    // Host -> Main -> Audience game state relay
    sendGameState: (state: GameState): void =>
        ipcRenderer.send('game-state', state),

    recvGameState: (callback: (state: GameState) => void): void => {
        ipcRenderer.on('game-state', (_event, state) => callback(state));
    },
});
