import { Setter } from "solid-js";
import { GameState } from "../../shared/game";
import { Board } from "../../shared/board";

interface SelectBoardFileProps {
    questionFile: string | null;
    setQuestionFile: Setter<string | null>;
    mediaFolder: string | null;
    setMediaFolder: Setter<string | null>;
    boards: Board[];
    setBoards: Setter<Board[]>;
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

    async function startGame() {
        if (!props.questionFile) throw new Error("Error: Question file not found!");
        if (!props.mediaFolder) throw new Error("Error: Media folder not found!");
        const result = await window.api.parseQuestionFile(props.questionFile);

        console.log(result);

        if ('error' in result)
            throw new Error("Error when parsing question file");

        props.setBoards(result.boards);
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
            <button onClick={() => props.onChangeState("StartScreen")}>Back</button>
            <button onClick={() => startGame()}>Play</button>
        </div>
    );
}
