import { createSignal, onMount, Switch, Match } from "solid-js";
import { AudienceState } from "../../shared/game";

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
        </Switch>
    );
}
