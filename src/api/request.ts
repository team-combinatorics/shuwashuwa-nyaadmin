import axios, { AxiosRequestConfig } from "axios";

import type { CommonResponse } from "~/models/commonResponse"

import { useUserStore } from "~/stores/user";
import { useGlobalStore } from "~/stores/global";

// wraps axios.request
// with token required
export const request = async (url: string, method: AxiosRequestConfig["method"], data?: any, isParam?: boolean, headers?: any) => {
    const store = useUserStore();
    const token = store.token;
    const { backendUrl } = useGlobalStore();

    if (typeof (headers) === "undefined" || !headers) {
        headers = {};
    }

    headers["token"] = token;

    let response = null;

    if (isParam) { // use params
        response = await axios.request<CommonResponse>(
            { url: url, baseURL: backendUrl, params: data, method: method, headers: headers })
    } else {  // use json (allow primitive types)
        headers["Content-type"] = "application/json";
        response = await axios.request<CommonResponse>(
            { url: url, baseURL: backendUrl, data: JSON.stringify(data), method: method, headers: headers });
    }

    if (response?.data.code === 200) {
        return response.data.data
        // token expired
    } else if (response?.data.code === 40007 || response?.data.code === 40006) {
        store.invalidateToken();
        console.error("token expired");
        console.error(response.data);
        throw Error(JSON.stringify(response.data));
    } else {
        console.error(response.data);
        throw Error(JSON.stringify(response.data))
    }
}

