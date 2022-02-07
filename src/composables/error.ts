import type { CommonResponse } from "~/models/commonResponse";

// transform a error to a commonresponse
export const parseError = (error: Error): CommonResponse => {
    // try to parse error
    try {
        error = JSON.parse(error.message);
    } catch (e) {
        if (typeof error === "string") {
            return {
                code: -1,
                message: error,
                data: null
            }
        }
        return {
            code: -1,
            message: "Unknown error",
            data: null
        }
    }

    // if error is an object, try to parse it
    if (typeof error === 'object') {
        // cast to commonresponse if possible
        if (error.code && error.message && error.data) {
            return {
                code: error.code,
                message: error.message,
                data: error.data
            }
        }
        // just a plain object
        return {
            code: -1,
            message: error.message,
            data: error
        }
    }

    return {
        code: -1,
        message: "Unknown error",
        data: null
    }
}

import type { MessageApiInjection } from "naive-ui/lib/message/src/MessageProvider";
import { Router } from "vue-router";

/**
 * Common error handler
 * redirect to login page if token expires; otherwise, show error message
 * @param error Runtime Error
 * @param message useMessage to show error message
 * @param router useRouter to redirect
 */
export const handleError = (error: Error, message: MessageApiInjection, router: Router) => {
    const errObj = parseError(error);
    console.error(errObj.message);
    if (errObj.code === 40006 || errObj.code === 40007) {
        // token expired or invalid
        message.error(errObj.message === "Error" ? "登录已过期，请重新登录" : errObj.message);
        // redirect to login
        setTimeout(() => {
            router.push('/login');
        }, 600);
    }
    else {
        message.error(errObj.message !== "Error" ? errObj.message : errObj.data);
    }
}