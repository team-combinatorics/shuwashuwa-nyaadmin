import axios, {AxiosRequestConfig} from "axios";

import {CommonResponse} from "~/models/commonResponse"

import { useGlobalStore } from "~/stores/global";

// wraps axios.request
// with token required
export const request = async (url: string, method: AxiosRequestConfig["method"] , data?: any, isParam?: boolean, headers?: any) => {
    const store = useGlobalStore();
    const token = store.token;
    const baseURL = store.backendUrl;

    if(typeof(headers) === "undefined" || !headers) {
        headers = {};
    }

    headers["token"] = token;

    let response = null;

    if (isParam) { // use params
        response = await axios.request <CommonResponse>(
            {url: url, baseURL: baseURL, params: data, method: method, headers: headers})
    } else {  // use json (allow primitive types)
        headers["Content-type"] = "application/json";
        response = await axios.request <CommonResponse>(
            {url: url, baseURL: baseURL, data: JSON.stringify(data), method: method, headers: headers});
    }

    if (response?.data.code === 200) {
        return response.data.data
    } else if (response?.data.code === 40007 || response?.data.code === 40006) {
        // token expired
        store.setToken("");
        throw Error(JSON.stringify(response.data));
    } else {
        throw Error(JSON.stringify(response.data))
    }
}

