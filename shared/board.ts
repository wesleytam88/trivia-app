export interface Board {
    id: string
    categories: Category[]
}

export interface Category {
    name: string
    description: string
    questions: Question[]
}

export interface Question {
    /** Question text */
    text: string

    /** Answer text */
    answer: string

    /** Point value of the question */
    value: number

    /** How long players are given to answer the question */
    time: number

    /**
     * Optional media for the question screen (video and/or audio).
     * Can be an https link or a local file path.
     */
    media?: string
}
