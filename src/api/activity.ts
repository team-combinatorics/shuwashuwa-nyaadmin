import {request} from "~/api/request";
import {Activity, ActivityInfo, ActivityQuery, TimeSlot} from "~/models/activity";

/**
 * Return Base64 Encoded QR image
 * @param activityid number
 */
export const getActivityQR: (activityid: number) => Promise<string> = async (activityid) => {
    const res = request("/api/super/QRCode", "get", {activityId: activityid}, true);
    return res as unknown as string;
}

export const getActivityList: (query?: ActivityQuery) => Promise<ActivityInfo[]> = async (query) => {
    const res = request("/api/activity", "get", query, true);
    return res as unknown as ActivityInfo[];
}

export const getActivityTimeSlots: (activityid: number) => Promise<TimeSlot[]> = async (activityid) => {
    const res = request("/api/activity/slot", "get", {activity: activityid}, true);
    return res as unknown as TimeSlot[];
}

export const addActivity: (activity: Activity) => Promise<string> = async (activity) => {
    const res = request("/api/super/activity", "post", activity);
    return res as unknown as string;
}

export const updateActivity: (activity: Activity) => Promise<string> = async (activity) => {
    const res = request("/api/super/activity", "patch", activity);
    return res as unknown as string;
}

export const deleteActivity: (activityid: number) => Promise<string> = async (activityid) => {
    const res = request("/api/super/activity", "delete", activityid);
    return res as unknown as string;
}