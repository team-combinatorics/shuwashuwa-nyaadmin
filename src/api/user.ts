import type { User } from "~/models/user";
import { request } from "./request";

export const getAdminInfo: (userid: number) => Promise<User> = async (userid) => {
    const res = request("/api/super/admin", "get", { userID: userid }, true);
    return res as unknown as User;
}

export const getUserInfo: (userid: number) => Promise<User> = async (userid) => {
    const res = request("/api/super/user", "get", { userID: userid }, true);
    return res as unknown as User;
}

export const getVolunteerInfo: (userid: number) => Promise<User> = async (userid) => {
    const res = request("/api/volunteer", "get", { userID: userid }, true);
    return res as unknown as User;
}

export const addAdmin: (userinfo: User) => Promise<string> = async (userinfo) => {
    const res = request("/api/super/admin", "post", userinfo);
    return res as unknown as string;
}

export const deleteAdmin: (userid: number) => Promise<string> = async (userid) => {
    const res = request("/api/super/admin", "delete", { userID: userid }, true);
    return res as unknown as string;
}

export const updateAdmin: (userinfo: User) => Promise<string> = async (userinfo) => {
    const res = request("/api/super/admin", "patch", userinfo);
    return res as unknown as string;
}

export const getAdminList: () => Promise<User[]> = async () => {
    const res = request("/api/super/admin/list", "get");
    return res as unknown as User[];
}

export const getVolunteerList: () => Promise<User[]> = async () => {
    const res = request("/api/volunteer/list", "get");
    return res as unknown as User[];
}