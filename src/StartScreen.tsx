import { GameState } from "../shared/game";

export function StartScreen(props: { onChangeState: (state: GameState) => void }) {
    return (
        <div>
            <h1>Trivia Program</h1>
            <button
                onClick={() => props.onChangeState("AddPlayers")}
                textContent="Add Players"
            />
        </div>
    );
};
