interface ElectronAPI {
    selectQuestionFile: () => Promise<string | null>;
    selectMediaFolder: () => Promise<string | null>;
}

declare interface Window {
    api: ElectronAPI;
}
