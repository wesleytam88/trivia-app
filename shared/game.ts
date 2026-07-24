import { Board } from "./board";
import { Player } from "./player";

export type QuestionResult = "end" | "correct"

export type GameState = 
    | "StartScreen"
    | "AddPlayers"
    | "SelectBoardFiles"
    | "BoardView"
    | "QuestionView"
    | "Scoreboard"
    | "FinalScores"

/** Discriminated union containing the screen and all the data needed to render that screen */
export type AudienceState = 
    | { screen: "Text"; text: string }
    | { screen: "WaitForAddPlayer"; playerName: string }    // Waiting for player to buzz in to be added
    | { screen: "AudienceBoardView"; board: Board }
    | {
        screen: "AudienceQuestionView";
        categoryName: string;
        questionText: string;
        media: string[];
        totalDuration: number;
      }
    | { screen: "AudienceScoreboard"; players: Player[] }
