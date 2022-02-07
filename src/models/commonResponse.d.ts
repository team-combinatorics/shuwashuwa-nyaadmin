/**
 * Common response type
 * Skip type checking for data
 */
export interface CommonResponse {
    code: number,
    message: string,
    data: any
}