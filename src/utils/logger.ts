export enum LoggerColors {
    red = "#E05267",
    orange = "#E06552",
    teal = "#52E0C4",
    blue = "#5273E0",
    blurple = "#5865F2",
    purple = "#B852E0",
}

export class Logger {
    private readonly tag: string;
    private readonly color?: string;
    private static readonly tagPadding: number = 30;

    constructor(tag: string, color?: string) {
        this.tag = tag;
        this.color = color;
    }

    group(...info: any) {
        console.groupCollapsed(...this.getEmojiStyleArr(" "), ...info);
    }

    groupEnd() {
        console.groupEnd();
    }

    log(...info: any) {
        console.log(...this.getEmojiStyleArr(" "), ...info);
    }

    info(...info: any) {
        console.info(...this.getEmojiStyleArr("💬"), ...info);
    }

    warn(...info: any) {
        console.warn(...this.getEmojiStyleArr("⚠"), ...info);
    }

    error(...info: any) {
        console.error(...this.getEmojiStyleArr("❌"), ...info);
    }

    getEmojiStyleArr(emoji: string) {
        return [
            `%c ${emoji}  %c ${this.tag.padEnd(Logger.tagPadding, " ")} `,
            `background: ${
                this.color ? this.color : "#44484a"
            }; color: #aaa; padding: 0 5px; border-top-left-radius: 4px; border-bottom-left-radius: 5px;`,
            `background: ${
                this.color ? this.color + "7f" : "#333438"
            }; color: #aaa; border-top-right-radius: 4px; border-bottom-right-radius: 4px;`,
        ];
    }
}
