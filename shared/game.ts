import { Board } from "./board";

export type QuestionResult = "end"

export type GameState = 
    | "StartScreen"
    | "AddPlayers"
    | "SelectBoardFiles"
    | "BoardView"
    | "QuestionView"
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
