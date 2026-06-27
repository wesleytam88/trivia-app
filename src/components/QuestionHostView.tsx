import { createSignal, onMount, onCleanup } from "solid-js";
import { Question } from "../../shared/board";
import { QuestionResult } from "../../shared/game";

interface QuestionHostViewProps {
    categoryName: string;
    question: Question;
    /** Total timer duration in seconds */
    totalDuration: number;
    onDone: (result: QuestionResult) => void;
}

export function QuestionHostView(props: QuestionHostViewProps) {
    const [remaining, setRemaining] = createSignal(props.totalDuration);
    const [paused, setPaused] = createSignal(false);

    let intervalId: ReturnType<typeof setInterval>;

    onMount(() => {
        intervalId = setInterval(() => {
            if (paused()) return;

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
    });

    onCleanup(() => clearInterval(intervalId));

    function handlePause() {
        const next = !paused();
        setPaused(next);
        window.api.sendAudiencePause(next);
    }

    function handleEnd() {
        clearInterval(intervalId);
        props.onDone("end");
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

            {/* Controls */}
            <div>
                <button onclick={handlePause}>
                    {paused() ? "Resume" : "Pause"}
                </button>
                <button onclick={handleEnd}>End</button>
            </div>

            {/* Timer */}
            <div>
                <span>{remaining()}</span>
            </div>
        </div>
    );
}
