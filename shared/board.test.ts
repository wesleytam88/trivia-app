import { describe, test, expect } from 'vitest';
import { basename } from './board';

describe('basename()', () => {
    test('Test standard inputs', () => {
        expect(basename("file.txt")).toBe("file.txt");
        expect(basename("/home/user/file.txt")).toBe("file.txt");
        expect(basename("/home/dir")).toBe("dir");
    });

    test('Test Windows-style paths', () => {
        expect(basename("C:\\Users\\user\\file.txt")).toBe("file.txt");
        expect(basename("C:\\Users\\folder")).toBe("folder");
    });

    test('Test edge cases', () => {
        expect(basename("/path/with spaces/file name.txt")).toBe("file name.txt");
        expect(basename("/路径/文件.txt")).toBe("文件.txt");
        expect(basename("/very/long/path/with/many/segments/file.txt")).toBe("file.txt");
    });
});
