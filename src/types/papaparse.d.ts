declare module 'papaparse' {
    export interface ParseConfig<T> {
        worker?: boolean;
        skipEmptyLines?: boolean | 'greedy';
        complete?: (results: ParseResult<T>) => void;
        error?: (err: any) => void;
        [key: string]: any;
    }

    export interface ParseResult<T> {
        data: T[];
        errors: any[];
        meta: any;
    }

    export function parse<T = any>(csvString: string, config?: ParseConfig<T>): { abort?: () => void };

    // Add more exports as needed, e.g. unparse, etc.
    const Papa: {
        parse: typeof parse;
    }

    export default Papa;
}
  