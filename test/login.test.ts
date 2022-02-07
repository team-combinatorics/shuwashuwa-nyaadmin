import { setActivePinia, createPinia } from 'pinia';

import { changePassword, login } from "../src/api/login";
import { CommonResponse } from "~/models/commonResponse";

import { useUserStore } from "~/stores/user";
import { useGlobalStore } from "~/stores/global";

beforeEach(() => {
    setActivePinia(createPinia())
    const globalStore = useGlobalStore()
    globalStore.setBackendUrl("http://shuwashuwa.kinami.cc:8848")
})

it("login", async () => {
        const store = useUserStore();
        const res = await login("shuwashuwa", "Tsugudaisuki");
        console.log(res);
        expect(store.token).equals(res);
    }
)

it("login fails", async () => {
        try {
            const res = await login("shuwashuwa", "Tsugodaisuki");
            throw Error("login success with wrong password")
        } catch (e: any) {
            const err = JSON.parse(e.message) as CommonResponse;
            console.log(err);
            // username or password incorrect
            expect(err.code).toBe(40011);  
        }
    }
)

it("change password", async ()=>{
    await login("shuwashuwa", "Tsugudaisuki");
    const res = await changePassword("Tsugudaisuki", "Tsugudaisuki");
    console.log(res);
})