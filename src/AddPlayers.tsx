import { createSignal } from "solid-js";
import { GameState } from "../electron/types/game";

export function AddPlayers(props: { onChangeState: (state: GameState) => void }) {
    const [name, setName] = createSignal("");

    return (
        <div>
            <h1>Adding Players</h1>
            <input
                type="text"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
            />
            <button>Add Player</button>
            <button onClick={() => props.onChangeState("StartScreen")}>
                Done
            </button>
        </div>
    );
};
