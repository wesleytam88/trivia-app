import { createSignal, Setter, Show } from "solid-js";
import { SetStoreFunction, reconcile } from "solid-js/store";
import { GameState } from "../../shared/game";
import { Board } from "../../shared/board";

interface SelectBoardFileProps {
    questionFile: string | null;
    setQuestionFile: Setter<string | null>;
    mediaFolder: string | null;
    setMediaFolder: Setter<string | null>;
    boards: Board[];
    setBoards: SetStoreFunction<Board[]>;
    onChangeState: (state: GameState) => void;
}

/** Extract the file or folder name from a full path. */
function basename(path: string): string {
    return path.split(/[/\\]/).pop() ?? path;
}

export function SelectBoardFiles(props: SelectBoardFileProps) {
    const [errMsg, setErrMsg] = createSignal<string>("");

    async function selectFile() {
        const path = await window.api.selectQuestionFile();
        if (path) props.setQuestionFile(path);
    }

    async function selectFolder() {
        const path = await window.api.selectMediaFolder();
        if (path) props.setMediaFolder(path);
    }

    async function startGame() {
        if (!props.questionFile) {
            setErrMsg("Error: Question file not found!");
            throw new Error("Error: Question file not found!");
        }

        if (!props.mediaFolder) {
            setErrMsg("Error: Media folder not found!");
            throw new Error("Error: Media folder not found!");
        }

        const result = await window.api.parseQuestionFile(props.questionFile);
        console.log(result);

        if ('error' in result) {
            setErrMsg(`Error when parsing question file: ${result.error}`);
            throw new Error("Error when parsing question file");
        }

        // Check if there are any missing media files
        const missing = await window.api.validateMediaFiles(result.boards, props.mediaFolder);
        if (missing.length > 0) {
            const missingNames = missing.map(basename);
            setErrMsg(`Missing media files: ${missingNames.join(", ")}`);
            throw new Error(`Missing media files: ${missingNames}`);
        }

        props.setBoards(reconcile(result.boards));
        props.onChangeState("BoardView");
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
            <Show when={errMsg() !== ""}>
                <p style={{ color: "red" }}>
                    {errMsg()}
                </p>
            </Show>
        </div>
    );
}
