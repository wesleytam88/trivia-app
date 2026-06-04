import { createSignal, Switch, Match } from "solid-js";
import { createStore } from "solid-js/store";
import { GameState } from "../shared/game";
import { Player } from "../shared/player";
import { StartScreen } from "./components/StartScreen";
import { AddPlayers } from "./components/AddPlayers";
import { SelectBoardFiles } from "./components/SelectBoardFiles";

export const App = () => {
    const [gameState, setGameState] = createSignal<GameState>("StartScreen");
    const [players, setPlayers] = createStore<Player[]>([]);
    const [questionFile, setQuestionFile] = createSignal<string | null>(null);
    const [mediaFolder, setMediaFolder] = createSignal<string | null>(null);

    return (
        <Switch fallback={<StartScreen onChangeState={setGameState}/>}>
            <Match when={gameState() === "StartScreen"}>
                <StartScreen onChangeState={setGameState} />
            </Match>

            <Match when={gameState() === "AddPlayers"}>
                <AddPlayers 
                    players={players}
                    setPlayers={setPlayers}
                    onChangeState={setGameState}
                />
            </Match>

            <Match when={gameState() === "SelectBoardFiles"}>
                <SelectBoardFiles 
                    questionFile={questionFile()}
                    setQuestionFile={setQuestionFile}
                    mediaFolder={mediaFolder()}
                    setMediaFolder={setMediaFolder}
                    onChangeState={setGameState}
                />
            </Match>
        </Switch>
    );
}
