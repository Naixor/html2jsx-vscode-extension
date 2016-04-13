declare module 'htmltojsx' {
    export class HTMLtoJSX {
        constructor(options?: {
            createClass?: boolean;
            outputClassName?: string;
            /** as a string e.g. '    ' or '\t' */
            indent?: string;
        });
        convert(html: string): string;
    }
}