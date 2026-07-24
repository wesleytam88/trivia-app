import { Show, For } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { Player } from "../../shared/player";

interface PlayerListProps {
    players: Player[];
    setPlayers?: SetStoreFunction<Player[]>;
    readonly?: boolean;
}

export function PlayerList(props: PlayerListProps) {
    function removePlayer(index: number) {
        props.setPlayers?.(prev => prev.filter((_, i) => i !== index));
    }

    function updateName(index: number, newName: string) {
        props.setPlayers?.(index, "name", newName);
    }

    function updatePoints(index: number, newPoints: number) {
        props.setPlayers?.(index, "points", newPoints);
    }

    return (
        <Show when={props.players.length > 0}>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Points</th>
                        {/* <th>Button Id</th> */}
                    </tr>
                </thead>
                <tbody>
                    <For each={props.players}>
                        {(player, index) => 
                            <tr>
                                <Show when={!props.readonly} fallback={
                                    <>
                                        <td>{player.name}</td>
                                        <td>{player.points}</td>
                                    </>
                                }>
                                    <td>
                                        <input
                                            type="text" 
                                            value={player.name}
                                            onInput={e => updateName(
                                                index(), 
                                                e.currentTarget.value
                                            )}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            type="number"
                                            value={player.points}
                                            onInput={e => updatePoints(
                                                index(),
                                                Number(e.currentTarget.value)
                                            )}
                                        />
                                    </td>
                                    {/* <td>{player.id}</td> */}
                                    <td>
                                        <button onClick={() => removePlayer(index())}>
                                            X
                                        </button>
                                    </td>
                                </Show>
                            </tr>
                        }
                    </For>
                </tbody>
            </table>
        </Show>
    );
}
