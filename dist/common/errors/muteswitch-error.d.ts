import { ErrorCodes } from '../..';
export declare class MuteSwitchError extends Error {
    name: string;
    code: ErrorCodes;
    message: string;
    constructor(message: string, code: ErrorCodes);
}
