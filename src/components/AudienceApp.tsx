import { createSignal, onMount, Switch, Match } from "solid-js";
import { AudienceState } from "../../shared/game";
import { BoardGrid } from "./BoardGrid";
import { QuestionAudienceView } from "./QuestionAudienceView";
import { PlayerList } from "./PlayerList";

export function AudienceApp() {
    const [state, setState] = createSignal<AudienceState>({ screen: "Text", text: "Setting up Game" });

    onMount(() => {
        window.api.recvAudienceState((state: AudienceState) => {
            setState(state);
        });
    });

    /** Takes in a screen "type/variant", returns the state if it matches, undefined otherwise */
    function screenIs<S extends AudienceState["screen"]>(screen: S) {
        const current = state();

        if (current.screen !== screen)
            return undefined;
        return current as Extract<AudienceState, { screen: S }>;
    }

    return (
        <Switch>
            <Match when={screenIs("Text")}>
                {s => <p>{s().text}</p>}
            </Match>

            <Match when={screenIs("WaitForAddPlayer")}>
                {s => <p>Press your button, {s().playerName}!</p>}
            </Match>

            <Match when={screenIs("AudienceBoardView")}>
                {s => <BoardGrid board={s().board} />}
            </Match>

            <Match when={screenIs("AudienceQuestionView")}>
                {s => (
                    <QuestionAudienceView
                        categoryName={s().categoryName}
                        questionText={s().questionText}
                        media={s().media}
                        totalDuration={s().totalDuration}
                    />
                )}
            </Match>

            <Match when={screenIs("AudienceScoreboard")}>
                {s => <PlayerList players={s().players} readonly />}
            </Match>
        </Switch>
    );
}
