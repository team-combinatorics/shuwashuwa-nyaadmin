import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
    setActivePinia(createPinia())
})

import {login} from "../src/api/login";
import {getServiceEventDetail, getServiceEventList} from "../src/api/service";


it("get service list", async ()=>{
    await login("shuwashuwa", "Tsugudaisuki");
    const list = await getServiceEventList();
    console.log(list);
})

it("get service detail", async ()=>{
    await login("shuwashuwa", "Tsugudaisuki");
    const list = await getServiceEventList();
    const lastId = list[list.length-1].serviceEventId;
    const res = await getServiceEventDetail(lastId);
    console.log(res);
    expect(res).toBeTruthy();
})