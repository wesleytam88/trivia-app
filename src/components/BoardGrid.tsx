import { Accessor, For, createMemo } from "solid-js";
import { Board, Category, Question } from "../../shared/board";

interface BoardGridProps {
    board: Board;
    onSelectQuestion?: (categoryIndex: number, questionIndex: number) => void;
}

export function BoardGrid(props: BoardGridProps) {
    const rowIndices = createMemo(() => {
        const max = Math.max(...props.board.categories.map((c: Category) => c.questions.length), 0);
        return Array.from({ length: max }, (_, i) => i);
    });

    return (
        <table>
            <thead>
                <tr>
                    <For each={props.board.categories}>
                        {(category: Category) => (
                            <th title={category.description}>
                                {category.name}
                            </th>
                        )}
                    </For>
                </tr>
            </thead>
            <tbody>
                <For each={rowIndices()}>
                    {(rowIdx: number) => (
                        <tr>
                            <For each={props.board.categories}>
                                {(category: Category, catIdx: Accessor<number>) => {
                                    const question = () => category.questions[rowIdx] as Question | undefined;
                                    return (
                                        <td>
                                            {/* Determines grid cells */}
                                            {question() && !question()?.answered ? (
                                                <button
                                                    onclick={() => props.onSelectQuestion?.(catIdx(), rowIdx)}
                                                    // disabled={!props.onSelectQuestion}
                                                >
                                                    {question()?.value}
                                                </button>
                                            ) : question()?.answered ? (
                                                <span style={{ opacity: "0.3" }}>{question()?.value}</span> 
                                            ) : null}
                                        </td>
                                    );
                                }}
                            </For>
                        </tr>
                    )}
                </For>
            </tbody>
        </table>
    );
}
