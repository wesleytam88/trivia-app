import { createSignal, Switch, Match } from "solid-js";
import { createStore } from "solid-js/store";
import { GameState } from "../shared/game";
import { Player } from "../shared/player";
import { StartScreen } from "./StartScreen";
import { AddPlayers } from "./AddPlayers";

export const App = () => {
    const [gameState, setGameState] = createSignal<GameState>("StartScreen");
    const [players, setPlayers] = createStore<Player[]>([]);

    const onChangeState = (newState: GameState) => {
        setGameState(newState);
    }

    return (
        <Switch fallback={<StartScreen onChangeState={onChangeState}/>}>
            <Match when={gameState() === "StartScreen"}>
                <StartScreen onChangeState={onChangeState} />
            </Match>

            <Match when={gameState() === "AddPlayers"}>
                <AddPlayers 
                    players={players}
                    setPlayers={setPlayers}
                    onChangeState={onChangeState}
                />
            </Match>
        </Switch>
    );
}
