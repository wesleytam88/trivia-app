import * as XLSX from 'xlsx';
import { Board, Category, Question } from '../shared/board';
import { readFileSync } from 'fs';

/**
 * Parse a question file (.xlsx or .csv) into Board[].
 * 
 * Expected columns (header row is skipped):
 *   A: Board name    - blank = continue previous board
 *   B: Category name - blank = continue previous category
 *   C: Desription    - category description
 *   D: Points        - question point value
 *   E: Question text
 *   F: Answer text
 *   G: Extra time    - seconds added to base timer (can be <0)
 *   H: Files         - comma-separated media filenames
 */
export function parseQuestionFile(filePath: string): Board[] {
    const buffer = readFileSync(filePath);
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // header: 1 gives an array of arrays (each row is string[])
    const rows: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: undefined
    });

    const boards: Board[] = [];
    let currBoard: Board | null = null;
    let currCategory: Category | null = null;

    // skip header row (index 0)
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rawBoard = str(row[0]);
        const rawCategory = str(row[1]);
        const rawDescription = str(row[2]);
        const rawPoints = str(row[3]);
        const rawQuestion = str(row[4]);
        const rawAnswer = str(row[5]);
        const rawTime = row[6];
        const rawFiles = str(row[7]);

        const points = Number(rawPoints);
        if (isNaN(points))
            continue;

        // Board: new name -> new board; blank -> continue current board
        if (rawBoard) {
            // Check if a board with this name already exists
            const existing = boards.find(b => b.id === rawBoard);
            if (existing) {
                currBoard = existing;
            } else {
                currBoard = { id: rawBoard, categories: [] };
                boards.push(currBoard);
            }
            // New board resets the category carry-forward
            currCategory = null;
        }

        if (!currBoard) continue;

        // Category: new name -> new category; blank -> continue current category
        if (rawCategory) {
            const existing = currBoard.categories.find(c => c.name === rawCategory);
            if (existing) {
                currCategory = existing;
                // Update description for this category
                if (rawDescription) currCategory.description = rawDescription;
            } else {
                currCategory = {
                    name: rawCategory,
                    description: rawDescription ?? '',
                    questions: []
                };
                currBoard.categories.push(currCategory);
            }
        }

        if (!currCategory) continue;

        // Parse extra time (defaults to 0)
        let time = 0;
        if (rawTime !== undefined && rawTime !== '') {
            const parsed = Number(rawTime);
            if (!isNaN(parsed)) 
                time = parsed;
        }

        // Parse media files: split by comma, trim whitespace, drop empties
        const media = rawFiles
            ? rawFiles.split(',').map(f => f.trim()).filter(Boolean)
            : [];

        const question: Question = {
            text: rawQuestion ?? '',
            answer: rawAnswer ?? '',
            value: points,
            time: time,
            media: media
        };

        currCategory.questions.push(question);
    }

    return boards;
}

/** Coerce a cell value to a trimmed string, or undefined if blank/missing */
function str(value: string | number | undefined): string | undefined {
    if (value === undefined || value === null) return undefined;
    const s = String(value).trim();
    return s.length > 0 ? s : undefined;
}
