import axios from "axios";

import { SALogin } from "~/models/login";
import { CommonResponse } from "~/models/commonResponse";
import { request } from "~/api/request";
import { useGlobalStore } from "~/stores/global";

export const login: (username: string, password: string) => Promise<string> = async (username, password) => {
    const store = useGlobalStore();
    const loginCredential:SALogin = { userName: username, password: password }
    const baseURL = store.backendUrl;
    
    const res = await axios.get<CommonResponse>('/api/super/login',
        { baseURL: baseURL, params: loginCredential })
    
    if (res?.data.code === 200) {
        store.setToken(res.data.data);
        return res.data.data as string
    } else {
        throw Error(JSON.stringify(res.data))
    }
}

export const changePassword: (oldPass: string, newPass: string) => Promise<string> = async (oldPass, newPass) => {
    const res = request("/api/super/change", "put", {}, false, {oldPassword: oldPass, newPassword: newPass});
    return res as unknown as string;
}