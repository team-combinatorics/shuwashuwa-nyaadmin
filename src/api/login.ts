import axios from "axios";

import type { SALogin } from "~/models/login";
import type { CommonResponse } from "~/models/commonResponse";
import { request } from "~/api/request";
import { parseToken } from "~/composables/token-parser";

import { useUserStore } from "~/stores/user";
import { useGlobalStore } from "~/stores/global";
import { getAdminInfo } from "./user";

export const login: (username: string, password: string) => Promise<string> = async (username, password) => {
    const userStore = useUserStore();
    const globalStore = useGlobalStore();
    const loginCredential: SALogin = { userName: username, password: password }

    const backendUrl = globalStore.backendUrl as string;
    const url = '/api/super/login';

    const res = await axios.get<CommonResponse>(url,
        { baseURL: backendUrl, params: loginCredential })

    if (res?.data.code === 200) {
        const token = res.data.data as string;
        userStore.setToken(token);

        // load user info
        console.log("Logged In", parseToken(token));
        getAdminInfo(parseToken(token).userid)
        .then(userInfo => {
            console.log("User Info", userInfo);
            userStore.setUserInfo(userInfo);
        })
        .catch(err => console.log(err));

        return token
    } else {
        throw Error(JSON.stringify(res.data))
    }
}

export const changePassword: (oldPass: string, newPass: string) => Promise<string> = async (oldPass, newPass) => {
    const res = request("/api/super/change", "put", {}, false, { oldPassword: oldPass, newPassword: newPass });
    return res as unknown as string;
}