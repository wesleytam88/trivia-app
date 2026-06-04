import { GameState } from "../../shared/game";

export function StartScreen(props: { onChangeState: (state: GameState) => void }) {
    return (
        <div>
            <h1>Trivia Program</h1>
            <button onClick={() => props.onChangeState("AddPlayers")}>
                Add Players
            </button>
            <button onClick={() => props.onChangeState("SelectBoardFiles")}>
                Select Files
            </button>
        </div>
    );
}
