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

    /** 
     * Extra time offset in seconds. 
     * Added to the base question timer. Can be negative. */
    time: number

    /**
     * Media for the question screen (video and/or audio).
     * Can be an https link or a local file path. Empty if no media.
     */
    media: string[]
}
