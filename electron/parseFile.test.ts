import { describe, test, expect } from 'vitest'
import { str, parseQuestionFile } from './parseFile';
import sample from '../sample_questions/sample.json';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current test file
const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

describe('str()', () => {
    test('Test undefined input', () => {
        expect(str(undefined)).toBe(undefined);
    });

    test('Test normal string inputs', () => {
        expect(str("test")).toBe("test");
        expect(str("100")).toBe("100");
        expect(str("test  ")).toBe("test");
        expect(str("  test")).toBe("test");
        expect(str(" test ")).toBe("test");
    });

    test('Test number inputs', () => {
        expect(str(100)).toBe("100");
        expect(str(-10)).toBe("-10");
    });

    test('Test special character strings', () => {
        expect(str(`,;:"'!@#$%^&*()_+-=[]{}|;':<>?~/¥`))
            .toBe(`,;:"'!@#$%^&*()_+-=[]{}|;':<>?~/¥`);
        expect(str("àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ"))
            .toBe("àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ");
        expect(str("こんにちは")).toBe("こんにちは");   // Hiragana
        expect(str("ソフトウェア")).toBe("ソフトウェア");   // Katakana
        expect(str("東京")).toBe("東京");   // Kanji
    });
});

describe('parseQuestionFile()', () => {
    test('Test sample.xlsx file parsing', () => {
        const xlsxFile = join(_dirname, '..', 'sample_questions', 'sample.xlsx');
        const boards = parseQuestionFile(xlsxFile);
        expect(boards).toEqual(sample);
    });

    test('Test sample.csv file parsing', () => {
        const csvFile = join(_dirname, '..', 'sample_questions', 'sample.csv');
        const boards = parseQuestionFile(csvFile);
        expect(boards).toEqual(sample);
    });
});
