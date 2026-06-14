type AudienceState = import("../shared/game").AudienceState;
type ParseResult = import("../shared/board").ParseResult;
type Board = import("../shared/board").Board;

interface ElectronAPI {
    selectQuestionFile: () => Promise<string | null>;
    selectMediaFolder: () => Promise<string | null>;
    parseQuestionFile: (filePath: string) => Promise<ParseResult>;
    validateMediaFiles: (boards: Board[], mediaFolder: string) => Promise<string[]>;
    sendAudienceState: (state: AudienceState) => void;
    recvAudienceState: (callback: (state: AudienceState) => void) => void;
}

declare interface Window {
    api: ElectronAPI;
}
