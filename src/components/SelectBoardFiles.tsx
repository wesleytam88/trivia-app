import { Setter } from "solid-js";
import { GameState } from "../../shared/game";

interface SelectBoardFileProps {
    questionFile: string | null;
    setQuestionFile: Setter<string | null>;
    mediaFolder: string | null;
    setMediaFolder: Setter<string | null>;
    onChangeState: (state: GameState) => void;
}

/** Extract the file or folder name from a full path. */
function basename(path: string): string {
    return path.split(/[/\\]/).pop() ?? path;
}

export function SelectBoardFiles(props: SelectBoardFileProps) {
    async function selectFile() {
        const path = await window.api.selectQuestionFile();
        if (path) props.setQuestionFile(path);
    }

    async function selectFolder() {
        const path = await window.api.selectMediaFolder();
        if (path) props.setMediaFolder(path);
    }

    return (
        <div>
            <div>
                <button onClick={selectFile}>
                    Select Question File
                </button>
                <p>
                    {props.questionFile ? basename(props.questionFile) : "No file selected"}
                </p>
            </div>
            <div>
                <button onClick={selectFolder}>
                    Select Media Folder
                </button>
                <p>
                    {props.mediaFolder ? basename(props.mediaFolder) : "No folder selected"}
                </p>
            </div>
            <button onClick={() => props.onChangeState("StartScreen")}>Done</button>
        </div>
    );
}
