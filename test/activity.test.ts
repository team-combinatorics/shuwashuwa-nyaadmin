import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
    setActivePinia(createPinia())
})

import {login} from "../src/api/login";
import {
    getActivityList,
    addActivity,
    getActivityTimeSlots,
    updateActivity,
    deleteActivity,
    getActivityQR
} from "../src/api/activity";
import {Activity, ActivityInfo, ActivityQuery, TimeSlot} from "../src/models/activity";

it("launch activity", async () => {
    await login("shuwashuwa", "Tsugudaisuki");
    const act: Activity = {
        activityName: "Test Activity", endTime: "2021-10-18 11:45:14",
        location: "Tsugu's Dorm", startTime: "1926-08-17 11:45:14",
        timeSlots: [{timeSlot: 0, endTime: "2021-10-18 11:45:14", startTime: "1926-08-17 11:45:14"}]
    }
    await addActivity(act);
    console.log("activity created");
})

it("get activity list", async () => {
    await login("shuwashuwa", "Tsugudaisuki");
    const actList: ActivityInfo[] = await getActivityList();
    console.log(actList);
    expect(actList).toBeTruthy();
})

it("get activity list with param", async () => {
    await login("shuwashuwa", "Tsugudaisuki");
    const query: ActivityQuery = {
        startUpper: "1919-08-10 11:45:14",
        endLower: "1919-08-10 11:45:14"
    }
    const actList: ActivityInfo[] = await getActivityList(query);
    console.log(actList);
    expect(actList).toEqual([]);
})

it("get activity timeslots", async ()=> {
    await login("shuwashuwa", "Tsugudaisuki");
    const actList: ActivityInfo[] = await getActivityList();
    const lastId = actList[actList.length-1].id as number;
    console.log(lastId);
    const actDetail: TimeSlot[] = await getActivityTimeSlots(lastId);
    console.log(actDetail);
    expect(actDetail).toBeTruthy();
})

it("get activity QR", async ()=>{
    await login("shuwashuwa", "Tsugudaisuki");
    const actList: ActivityInfo[] = await getActivityList();
    const lastId = actList[actList.length-1].id as number;
    const res: string = await getActivityQR(lastId);
    console.log(res);
    expect(res).toBeTruthy();
})

it("update activity", async ()=> {
    await login("shuwashuwa", "Tsugudaisuki");
    let actList: ActivityInfo[] = await getActivityList();
    const lastId = actList[actList.length-1].id as number;
    const act:Activity = {
        activityId: lastId, activityName: "Test Activity", endTime: "1926-08-18 11:45:14",
        location: "Tsugu's House", startTime: "1926-08-17 11:45:14",
        timeSlots: [{timeSlot: 0, endTime: "1926-08-18 11:45:14", startTime: "1926-08-17 11:45:14"}]
    }
    await updateActivity(act);
    actList = await getActivityList();
    console.log(actList[actList.length-1].location);
    expect(actList[actList.length-1].location).toEqual("Tsugu's House");
})

it("delete activity", async ()=> {
    await login("shuwashuwa", "Tsugudaisuki");
    const actList: ActivityInfo[] = await getActivityList();
    const lastId = actList[actList.length-1].id as number;
    console.log(lastId)
    await deleteActivity(lastId);
})
