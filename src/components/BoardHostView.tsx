import { Board } from "../../shared/board";
import { BoardGrid } from "./BoardGrid";

interface BoardHostViewProps {
    board: Board;
    onSelectQuestion: (categoryIndex: number, questionIndex: number) => void;
}

export function BoardHostView(props: BoardHostViewProps) {
    return (
        <div>
            <BoardGrid
                board={props.board}
                onSelectQuestion={props.onSelectQuestion}
            />
            <div style={{ display: "flex" }}>
                <button style={{ flex: "1" }}>
                    Players
                </button>
                <button style={{ flex: "1" }}>
                    Advanced
                </button>
                <button style={{ flex: "1" }}>
                    Settings
                </button>
            </div>
        </div>
    );
}
