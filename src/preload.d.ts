type AudienceState = import("../shared/game").AudienceState;
type ParseResult = import("../shared/board").ParseResult;

interface ElectronAPI {
    selectQuestionFile: () => Promise<string | null>;
    selectMediaFolder: () => Promise<string | null>;
    parseQuestionFile: (filePath: string) => Promise<ParseResult>;
    sendAudienceState: (state: AudienceState) => void;
    recvAudienceState: (callback: (state: AudienceState) => void) => void;
}

declare interface Window {
    api: ElectronAPI;
}
