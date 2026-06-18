import { createSignal, Switch, Match, createEffect } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import { GameState, AudienceState } from "../shared/game";
import { Board, Category, Question } from "../shared/board";
import { Player } from "../shared/player";
import { PlayerList } from "./components/PlayerList";
import { StartScreen } from "./components/StartScreen";
import { AddPlayers } from "./components/AddPlayers";
import { SelectBoardFiles } from "./components/SelectBoardFiles";
import { BoardHostView } from "./components/BoardHostView";
import { AudienceApp } from "./components/AudienceApp";

const windowType = new URLSearchParams(window.location.search).get("window");

/** Map a GameState to the default AudienceState for that screen. */
function defaultAudienceState(state: GameState, boards?: Board[], boardIndex?: number): AudienceState {
    switch (state) {
        case "AddPlayers":
            return { screen: "Text", text: "Adding Players" };
        case "StartScreen":
        case "SelectBoardFiles":
            return { screen: "Text", text: "Setting up Game" };
        case "BoardView":
            const board = boards?.[boardIndex ?? 0];
            if (!board)
                return { screen: "Text", text: "No board loaded" };
            // unwrap strips SolidJS store Proxy so object can be structure-cloned across Electron IPC
            return { screen: "AudienceBoardView", board: unwrap(board) };
        case "FinalScores":
            // TODO: Implement final scores
            return { screen: "Text", text: "Final Scores"}
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
    const [boards, setBoards] = createStore<Board[]>([]);
    const [currBoardIndex, setCurrBoardIndex] = createSignal(0);

    // Automatically track changes in game state and update the audience window
    createEffect(() => {
        const newState = defaultAudienceState(gameState(), boards, currBoardIndex());
        window.api.sendAudienceState(newState);
    });

    function changeState(newState: GameState) {
        // Will also update the audience window via the effect above
        setGameState(newState);
    }

    function handleSelectQuestion(categoryIndex: number, questionIndex: number) {
        const boardIndx = currBoardIndex();
        setBoards(boardIndx, "categories", categoryIndex, "questions", questionIndex, "answered", true);

        // Check if all questions on the current board are answered
        const board = boards[boardIndx];
        const allAnswered = board.categories.every((cat: Category) => 
            cat.questions.every((q: Question) => q.answered)
        );

        if (allAnswered) {
            if (boardIndx + 1 < boards.length) {
                setCurrBoardIndex(boardIndx + 1);
            } else {
                setGameState("FinalScores");
            }
        }
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
                        boards={boards}
                        setBoards={setBoards}
                        onChangeState={changeState}
                    />
                </Match>

                <Match when={gameState() === "BoardView"}>
                    <BoardHostView
                        board={boards[currBoardIndex()]}
                        onSelectQuestion={handleSelectQuestion}
                    />
                </Match>

                <Match when={gameState() === "FinalScores"}>
                    {/* TODO: Implement final scores */}
                    <p>Final Scores</p>
                </Match>
            </Switch>
            <PlayerList players={players} setPlayers={setPlayers} />
        </div>
    );
}
