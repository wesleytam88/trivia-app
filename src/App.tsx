import { createSignal, Switch, Match, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { GameState, AudienceState } from "../shared/game";
import { Player } from "../shared/player";
import { PlayerList } from "./components/PlayerList";
import { StartScreen } from "./components/StartScreen";
import { AddPlayers } from "./components/AddPlayers";
import { SelectBoardFiles } from "./components/SelectBoardFiles";
import { AudienceApp } from "./components/AudienceApp";

const windowType = new URLSearchParams(window.location.search).get("window");

/** Map a GameState to the default AudienceState for that screen. */
function defaultAudienceState(state: GameState): AudienceState {
    switch (state) {
        case "AddPlayers":
            return { screen: "Text", text: "Adding Players" };
        case "StartScreen":
        case "SelectBoardFiles":
            return { screen: "Text", text: "Setting up Game" };
        default:
            return { screen: "Text", text: "ERROR: Game state not found!" }
    }
}

export const App = () => {
    if (windowType === "audience") {
        return <AudienceApp />
    }

    const [gameState, setGameState] = createSignal<GameState>("StartScreen");
    const [players, setPlayers] = createStore<Player[]>([]);
    const [questionFile, setQuestionFile] = createSignal<string | null>(null);
    const [mediaFolder, setMediaFolder] = createSignal<string | null>(null);
    const [boards, setBoards] = createSignal<Board[]>([]);

    // Send initial state so the audience window gets it on startup
    onMount(() => window.api.sendAudienceState(defaultAudienceState(gameState())));

    function changeState(newState: GameState) {
        // Wrapper that also sends the state to the audience window to sync
        setGameState(newState);
        window.api.sendAudienceState(defaultAudienceState(gameState()));
    }

    return (
        <div style={{ display: "flex" }}>
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
                        boards={boards()}
                        setBoards={setBoards}
                        onChangeState={changeState}
                    />
                </Match>
            </Switch>
            <PlayerList players={players} setPlayers={setPlayers} />
        </div>
    );
}
