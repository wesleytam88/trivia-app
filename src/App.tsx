import { createSignal, Switch, Match, onMount } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import { GameState, AudienceState, QuestionResult } from "../shared/game";
import { Board, Category, Question } from "../shared/board";
import { Player } from "../shared/player";
import { PlayerList } from "./components/PlayerList";
import { StartScreen } from "./components/StartScreen";
import { AddPlayers } from "./components/AddPlayers";
import { SelectBoardFiles } from "./components/SelectBoardFiles";
import { BoardHostView } from "./components/BoardHostView";
import { QuestionHostView } from "./components/QuestionHostView";
import { AudienceApp } from "./components/AudienceApp";

import settings from "../settings.json";

const windowType = new URLSearchParams(window.location.search).get("window");

/** Map a GameState to the default AudienceState for that screen. */
function defaultAudienceState(state: GameState, boards?: Board[], boardIndex?: number, players?: Player[]): AudienceState {
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
        case "QuestionView":
            // Audience state for QuestionView is sent directly in handleSelectQuestion()
            // not through syncAudienceView() because it carrier per-question data
            return { screen: "Text", text: "Question State" };
        case "Scoreboard":
            // unwrap strips SolidJS store Proxy for IPC
            return { screen: "AudienceScoreboard", players: unwrap(players ?? []) };
        case "FinalScores":
            // TODO: Implement final scores
            return { screen: "Text", text: "Final Scores"};
        default:
            return { screen: "Text", text: "ERROR: Game state not found!" };
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
    const [selectedQuestion, setSelectedQuestion] = createSignal<{
        boardIdx: number,
        catIdx: number,
        qIdx: number
    } | null>(null);

    // Send initial state so the audience window gets it on startup
    onMount(() => window.api.sendAudienceState(defaultAudienceState(gameState())));

    /** Send the current board state to the audience window */
    function syncAudienceWindow() {
        window.api.sendAudienceState(
            defaultAudienceState(gameState(), boards, currBoardIndex())
        );
    }

    /** Wrapper that also sends the state to the audience window to sync */
    function changeState(newState: GameState) {
        setGameState(newState);
        syncAudienceWindow();
    }

    /** Logic to handle clicking on a question cell */
    function handleSelectQuestion(categoryIndex: number, questionIndex: number) {
        const boardIdx = currBoardIndex();
        const category = boards[boardIdx].categories[categoryIndex];
        const question = category.questions[questionIndex];
        const totalDuration = settings.BASE_QUESTION_TIME_SECONDS + question.time;

        setSelectedQuestion({ boardIdx, catIdx: categoryIndex, qIdx: questionIndex});
        setGameState("QuestionView");

        // Send audience state directly
        // Carries question-unique data not available via syncAudienceWindow()
        window.api.sendAudienceState({
            screen: "AudienceQuestionView",
            categoryName: category.name,
            questionText: question.text,
            media: unwrap(question.media),
            totalDuration
        });
    }

    /** Update a player's score */
    function handleScoreChange(playerIndex: number, change: number) {
        setPlayers(playerIndex, "points", prev => prev + change);
    }

    /** Advance from the current question back to (or to the next) board, or final scres */
    function advanceFromQuestion(boardIdx: number) {
        const board = boards[boardIdx];
        const allAnswered = board.categories.every((cat: Category) => 
            cat.questions.every((q: Question) => q.answered)
        );

        if (allAnswered) {
            if (boardIdx + 1 < boards.length) {
                // Not the last board
                setCurrBoardIndex(boardIdx + 1);
                changeState("BoardView");
            } else {
                // Finished last board
                changeState("FinalScores");
            }
        } else {
            changeState("BoardView");
        }
    }

    /** Logic to handle when a question ends */
    function handleQuestionDone(result: QuestionResult) {
        const sel = selectedQuestion();
        if (!sel) return;

        const { boardIdx, catIdx, qIdx } = sel;

        setBoards(boardIdx, "categories", catIdx, "questions", qIdx, "answered", true);
        setSelectedQuestion(null);

        if (result === "correct") {
            // Show scoreboard on both windows, then advance
            const time_ms = settings.SCOREBOARD_TIME_SECONDS * 1000;
            changeState("Scoreboard");
            setTimeout(() => advanceFromQuestion(boardIdx), time_ms);
        } else {
            advanceFromQuestion(boardIdx);
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

                <Match when={gameState() === "QuestionView" && selectedQuestion()}>
                    {(sel) => {
                        const { boardIdx, catIdx, qIdx } = sel();
                        const category = boards[boardIdx].categories[catIdx];
                        const question = category.questions[qIdx];
                        return (
                            <QuestionHostView
                                categoryName={category.name}
                                question={question}
                                points={question.value}
                                totalDuration={settings.BASE_QUESTION_TIME_SECONDS + question.time}
                                players={players}
                                onScoreChange={handleScoreChange}
                                onDone={handleQuestionDone}
                            />
                        );
                    }}
                </Match>

                <Match when={gameState() === "Scoreboard"}>
                    <PlayerList players={players} readonly />
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
