import { createSignal, Show } from "solid-js";
import { GameState } from "../electron/types/game";
import { StartScreen } from "./StartScreen";
import { AddPlayers } from "./AddPlayers";

export const App = () => {
    const [gameState, setGameState] = createSignal<GameState>("StartScreen");

    const onChangeState = (newState: GameState) => {
        setGameState(newState);
    }

    return (
        <div>
            <Show when={gameState() === "StartScreen"}>
                <StartScreen onChangeState={onChangeState}/>
            </Show>
            <Show when={gameState() === "AddPlayers"}>
                <AddPlayers 
                    onChangeState={onChangeState}
                />
            </Show>
        </div>
    );
};
