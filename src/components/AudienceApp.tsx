import { createSignal, onMount, Switch, Match } from "solid-js";
import { GameState } from "../../shared/game";

export function AudienceApp() {
    const [gameState, setGameState] = createSignal<GameState>("StartScreen");

    onMount(() => {
        window.api.recvGameState((state: GameState) => {
            setGameState(state);
        });
    });

    return (
        <Switch>
            <Match when={gameState() === "StartScreen" || gameState() === "SelectBoardFiles"}>
                <p>Setting up Game</p>
            </Match>
        </Switch>
    )
}
