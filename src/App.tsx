import { createSignal, Switch, Match, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { GameState } from "../shared/game";
import { Player } from "../shared/player";
import { StartScreen } from "./components/StartScreen";
import { AddPlayers } from "./components/AddPlayers";
import { SelectBoardFiles } from "./components/SelectBoardFiles";
import { AudienceApp } from "./components/AudienceApp";

const windowType = new URLSearchParams(window.location.search).get("window");

export const App = () => {
    if (windowType === "audience") {
        return <AudienceApp />
    }

    const [gameState, setGameState] = createSignal<GameState>("StartScreen");
    const [players, setPlayers] = createStore<Player[]>([]);
    const [questionFile, setQuestionFile] = createSignal<string | null>(null);
    const [mediaFolder, setMediaFolder] = createSignal<string | null>(null);

    function changeState(newState: GameState) {
        // Wrapper that also sends the game state to the audience window to sync
        setGameState(newState);
        window.api.sendGameState(newState);
    }

    return (
        <Switch fallback={<StartScreen onChangeState={changeState}/>}>
            <Match when={gameState() === "StartScreen"}>
                <StartScreen onChangeState={changeState} />
            </Match>

            <Match when={gameState() === "AddPlayers"}>
                <AddPlayers 
                    players={players}
                    setPlayers={setPlayers}
                    onChangeState={changeState}
                />
            </Match>

            <Match when={gameState() === "SelectBoardFiles"}>
                <SelectBoardFiles 
                    questionFile={questionFile()}
                    setQuestionFile={setQuestionFile}
                    mediaFolder={mediaFolder()}
                    setMediaFolder={setMediaFolder}
                    onChangeState={changeState}
                />
            </Match>
        </Switch>
    );
}
