import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
    setActivePinia(createPinia())
    const globalStore = useGlobalStore()
    globalStore.setBackendUrl("http://shuwashuwa.kinami.cc:8848")
})

import {login} from "../src/api/login";
import {User} from "../src/models/user";
import {CommonResponse} from "../src/models/commonResponse";

import {
    getAdminInfo,
    getAdminList,
    addAdmin,
    deleteAdmin,
    updateAdmin,
    getVolunteerList,
    getVolunteerInfo
} from "../src/api/user";
import { useGlobalStore } from '~/stores/global'

it("get admin list", async ()=>{
    await login("shuwashuwa", "Tsugudaisuki");
    const adminlist = await getAdminList();
    console.log(adminlist);
})

it("get volunteer list", async ()=>{
    await login("shuwashuwa", "Tsugudaisuki");
    const volunteerlist = await getVolunteerList();
    console.log(volunteerlist);
})

it("get admin info", async ()=>{
    await login("shuwashuwa", "Tsugudaisuki");
    const adminlist = await getAdminList();
    const lastId = adminlist[adminlist.length-1].userid;

    const userInfo: User = await getAdminInfo(lastId);
    console.log(userInfo);
})

it("get volunteer info", async ()=>{
    await login("shuwashuwa", "Tsugudaisuki");
    const adminlist = await getVolunteerList();
    const lastId = adminlist[adminlist.length-1].userid;

    const userInfo: User = await getVolunteerInfo(lastId);
    console.log(userInfo);
})

it("add admin", async ()=>{
    await login("shuwashuwa", "Tsugudaisuki");
    const admin:User = {
        department: "茨菇音游学院",
        email: "Tsugu@Tsu.gu",
        identity: "裸茨菇",
        phoneNumber: "1145141919",
        studentId: "1919810",
        userName: "Tsugu",
        userid: 114
    }
    const res = await addAdmin(admin);
    console.log(res);
    const adminlist = await getAdminList();
    expect(adminlist).toContainEqual(admin);
})

it("update admin", async ()=>{
    await login("shuwashuwa", "Tsugudaisuki");
    const admin:User = {
        department: "茨菇音游学院",
        email: "Tsugu@Tsu.gu",
        identity: "草茨菇",
        phoneNumber: "1145141810",
        studentId: "1919810114",
        userName: "Tsugu",
        userid: 114
    }
    const res = await updateAdmin(admin);
    console.log(res);
    const adminlist = await getAdminList();
    expect(adminlist).toContainEqual(admin);
})

it("add admin duplicate", async () => {
    await login("shuwashuwa", "Tsugudaisuki");
    const admin:User = {
        department: "茨菇音游学院",
        email: "Tsugu@Tsu.gu",
        identity: "裸茨菇",
        phoneNumber: "1145141919",
        studentId: "1919810",
        userName: "Tsugu",
        userid: 114
    }
    try {
        await addAdmin(admin);
        await addAdmin(admin);
        throw Error("duplicate add success");
    } catch (e) {
        const err = JSON.parse(e.message) as CommonResponse;
        expect(err.code).toBe(40000);
    }
})

it("delete admin", async ()=>{
    await login("shuwashuwa", "Tsugudaisuki");

    const res = await deleteAdmin(114);
    console.log(res);

    const adminlist = await getAdminList();

    const admin:User = {
        department: "茨菇音游学院",
        email: "Tsugu@Tsu.gu",
        identity: "裸茨菇",
        phoneNumber: "1145141919",
        studentId: "1919810",
        userName: "Tsugu",
        userid: 114
    }
    expect(adminlist).not.toContainEqual(admin);
})

it("delete admin nonexist", async ()=>{
    await login("shuwashuwa", "Tsugudaisuki");
    try {
        await deleteAdmin(114514);
    } catch (e) {
        const err = JSON.parse(e.message) as CommonResponse;
        expect(err.code).toBe(40000);
    }
})