type AudienceState = import("../shared/game").AudienceState

interface ElectronAPI {
    selectQuestionFile: () => Promise<string | null>;
    selectMediaFolder: () => Promise<string | null>;
    sendAudienceState: (state: AudienceState) => void;
    recvAudienceState: (callback: (state: AudienceState) => void) => void;
}

declare interface Window {
    api: ElectronAPI;
}
