import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { Question } from "../../shared/board";
import { QuestionResult } from "../../shared/game";
import { Player, ButtonID } from "../../shared/player";
import { startListening, stopListening } from "../gamepad";

type QuestionState = "reading" | "paused" | "buzzed";

interface QuestionHostViewProps {
    categoryName: string;
    question: Question;
    /** Point value for this question */
    points: number;
    /** Total timer duration in seconds */
    totalDuration: number;
    players: Player[];
    onScoreChange: (playerIndex: number, delta: number) => void;
    onDone: (result: QuestionResult) => void;
}

export function QuestionHostView(props: QuestionHostViewProps) {
    const [remaining, setRemaining] = createSignal(props.totalDuration);
    const [questionState, setQuestionState] = createSignal<QuestionState>("reading");
    const [buzzedPlayer, setBuzzedPlayer] = createSignal<{ name: string, index: number } | null>(null);

    /** Players who already buzzed incorrectly, excluded from future buzzes */
    const alreadyBuzzed = new Set<ButtonID>;

    let intervalId: ReturnType<typeof setInterval>;

    /** Start gamepad polling */
    function startBuzzListening() {
        startListening((buttonId: ButtonID) => {
            if (alreadyBuzzed.has(buttonId))
                return;

            const playerIndex = props.players.findIndex(p => p.id === buttonId);
            if (playerIndex === -1) return;     // Not a player

            const player = props.players[playerIndex];

            // Pause the host timer
            setQuestionState("buzzed");
            setBuzzedPlayer({ name: player.name, index: playerIndex });
            stopListening();

            // Send player data to audience window
            window.api.sendAudienceBuzzIn(player.name);
        });
    }

    onMount(() => {
        // Start the 1-second countdown timer
        intervalId = setInterval(() => {
            if (questionState() !== "reading") return;

            setRemaining(prev => {
                const next = prev - 1;
                if (next <= 0) {
                    clearInterval(intervalId);
                    props.onDone("end");
                    return 0;
                }
                return next;
            });
        }, 1000);

        // Start listening for buzzes
        startBuzzListening();
    });

    onCleanup(() => {
        clearInterval(intervalId)
        stopListening();
    });

    function handlePause() {
        setQuestionState("paused");
        stopListening();
        window.api.sendAudiencePause(true);
    }

    function handleResume() {
        setQuestionState("reading");
        startBuzzListening();
        window.api.sendAudiencePause(false);
    }

    function handleEnd() {
        clearInterval(intervalId);
        stopListening();
        props.onDone("end");
    }

    function handleCorrect() {
        const player = buzzedPlayer();
        if (!player) return;

        clearInterval(intervalId);
        props.onScoreChange(player.index, props.points);

        // Clear audience buzz-in overlay before transitioning
        window.api.sendAudienceBuzzIn(null);
        props.onDone("correct");
    }

    function handleIncorrect() {
        const player = buzzedPlayer();
        if (!player) return;

        props.onScoreChange(player.index, -props.points);

        // Track this player so they cannot buzz in again
        const buttonId = props.players[player.index].id;
        alreadyBuzzed.add(buttonId);

        // Clear buzz-in state, resume question
        setBuzzedPlayer(null);
        setQuestionState("reading");

        // Tell audience window to clear overlay and resume
        window.api.sendAudienceBuzzIn(null);

        // Resume gamepad listening for remaining players
        startBuzzListening();
    }

    return (
        <div>
            {/* Question info */}
            <div>
                <span>Category:</span>
                <span>{props.categoryName}</span>
            </div>

            <div>
                <span>Question:</span>
                <span>{props.question.text}</span>
            </div>

            <div>
                <span>Answer:</span>
                <span>{props.question.answer}</span>
            </div>

            {/* Controls, dependent on Questionquestion state */}
            <div>
                <Show when={questionState() === "reading"}>
                    <button onclick={handlePause}>Pause</button>
                    <button onclick={handleEnd}>End</button>
                </Show>
                <Show when={questionState() === "paused"}>
                    <button onclick={handleResume}>Resume</button>
                    <button onclick={handleEnd}>End</button>
                </Show>
                <Show when={questionState() === "buzzed"}>
                    <div>
                        <span>{buzzedPlayer()?.name}</span>
                    </div>
                    <button onclick={handleCorrect}>Correct</button>
                    <button onclick={handleIncorrect}>Incorrect</button>
                    <button onclick={handleEnd}>End</button>
                </Show>
            </div>

            {/* Timer */}
            <div>
                <span>{remaining()}</span>
            </div>
        </div>
    );
}
