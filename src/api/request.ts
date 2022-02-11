import axios, { AxiosRequestConfig } from "axios";
import type { AxiosResponse } from "axios";

import type { CommonResponse } from "~/models/commonResponse"

import { useUserStore } from "~/stores/user";
import { useGlobalStore } from "~/stores/global";

/**
 * Wraps axios.request to add the user's token to the request header
 * @param url relative url to the api (/api/v1/...).
 * @param method request method
 * @param data payload (json/params)
 * @param isParam set to true on a GET request if the data is a query string
 * @param headers headers to add to the request
 */
export const request = async (url: string, method: AxiosRequestConfig["method"], data?: any, isParam?: boolean, headers?: any) => {
    const userStore = useUserStore();
    const token = userStore.token;
    
    const globalStore = useGlobalStore();

    const backendUrl = globalStore.backendUrl as string;

    if (typeof (headers) === "undefined" || !headers) {
        headers = {};
    }
    headers["token"] = token;

    let response: AxiosResponse<CommonResponse> | null = null;

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
        userStore.invalidateToken();
        console.error("token expired");
        console.error(response.data);
        throw Error(JSON.stringify(response.data));
    } else {
        console.error(response.data);
        throw Error(JSON.stringify(response.data))
    }
}

