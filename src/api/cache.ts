import {request} from '~/api/request';

export const getCacheSize: () => Promise <number> = async () => {
    const res = request("/api/super/cache", "get");
    return res as unknown as number;
}

export const deleteCache: (beforeDays: number)=> Promise<string> = async (beforeDays)=>{
    const res = request("/api/super/cache", "delete", {days: beforeDays}, true);
    return res as unknown as string;
}