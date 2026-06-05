export type GameState = 
    | "StartScreen"
    | "AddPlayers"
    | "SelectBoardFiles"

export const audienceText: Record<GameState, string> = {
    StartScreen: "Setting up Game",
    AddPlayers: "Adding Players",
    SelectBoardFiles: "Setting up Game"
}
