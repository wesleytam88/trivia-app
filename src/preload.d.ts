type GameState = import("../shared/game").GameState

interface ElectronAPI {
    selectQuestionFile: () => Promise<string | null>;
    selectMediaFolder: () => Promise<string | null>;
    sendGameState: (state: GameState) => void;
    recvGameState: (callback: (state: GameState) => void) => void;
}

declare interface Window {
    api: ElectronAPI;
}
