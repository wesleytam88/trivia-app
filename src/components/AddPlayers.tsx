import { createSignal, For, Show, onCleanup } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { GameState } from "../../shared/game";
import { Player, ButtonID } from "../../shared/player";
import { startListening, stopListening } from "../gamepad";

interface AddPlayerProps {
    players: Player[];
    setPlayers: SetStoreFunction<Player[]>;
    onChangeState: (state: GameState) => void;
}

export function AddPlayers(props: AddPlayerProps) {
    const [name, setName] = createSignal("");
    const [waiting, setWaiting] = createSignal(false);
    const [pendingName, setPendingName] = createSignal("");

    // Stop waiting if the component unmounts while waiting
    onCleanup(() => stopListening());

    function addPlayer() {
        const trimmed = name().trim();
        if (!trimmed) return;

        setPendingName(trimmed);
        setWaiting(true);
        setName("");
        window.api.sendAudienceState({ screen: "WaitForAddPlayer", playerName: trimmed });

        startListening((buttonId: ButtonID) => {
            stopListening();

            // First remove any existing player with this button
            const existing = props.players.findIndex(p => p.id === buttonId);
            if (existing !== -1) {
                props.setPlayers(prev => prev.filter((_, i) => i !== existing));
            }

            // ...then add the new player
            const p: Player = {id: buttonId, name: pendingName(), points: 0};
            props.setPlayers(prev => [...prev, p]);

            setWaiting(false);
            setPendingName("");
            window.api.sendAudienceState({ screen: "Text", text: "Adding Players" });
        });
    }

    function cancelAdd() {
        stopListening();
        setWaiting(false);
        setPendingName("");
        window.api.sendAudienceState({ screen: "Text", text: "Adding Players" });
    }

    function removePlayer(index: number) {
        props.setPlayers(prev => prev.filter((_, i) => i !== index));
    }

    function updateName(index: number, newName: string) {
        props.setPlayers(index, "name", newName);
    }

    return (
        <div>
            <h1>Players</h1>

            {/* Player list */}
            <Show when={props.players.length > 0}>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Points</th>
                            <th>Button Id</th>
                        </tr>
                    </thead>
                    <tbody>
                        <For each={props.players}>
                            {(player, index) => 
                                <tr>
                                    <td>
                                        <input
                                            type="text" 
                                            value={player.name}
                                            onInput={e => updateName(
                                                index(), 
                                                e.currentTarget.value)
                                            }
                                        />
                                    </td>
                                    <td>{player.points}</td>
                                    <td>{player.id}</td>
                                    <td>
                                        <button onClick={() => removePlayer(index())}>
                                            X
                                        </button>
                                    </td>
                                </tr>
                            }
                        </For>
                    </tbody>
                </table>
            </Show>

            {/* Add player form / waiting state */}
            <Show
                when={!waiting()}
                fallback={
                    <div>
                        <p>Waiting for input</p>
                        <button onClick={cancelAdd}>Cancel</button>
                    </div>
                }
            >
                <div>
                    <input
                        type="text"
                        value={name()}
                        onInput={e => setName(e.currentTarget.value)}
                        onKeyDown={e => { if (e.key === "Enter") addPlayer(); }}
                        placeholder="Player name"
                    />
                    <button onClick={addPlayer}>Add</button>
                </div>
            </Show>

            {/* Navigation */}
            <Show when={!waiting()}>
                <button onClick={() => props.onChangeState("StartScreen")}>
                    Done
                </button>
            </Show>
        </div>
    );
}
