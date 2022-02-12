import { setActivePinia, createPinia } from 'pinia'
import { useGlobalStore } from '~/stores/global'

beforeEach(() => {
    setActivePinia(createPinia())
    const globalStore = useGlobalStore()
    globalStore.setBackendUrl("http://shuwashuwa.kinami.cc:8848")
})

import {login} from "../src/api/login";
import {getServiceEventDetail, getServiceEventList, auditServiceEvent} from "../src/api/service";


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

it("audit service", async ()=>{
    await login("shuwashuwa", "Tsugudaisuki");
    const list = await getServiceEventList({ status: 1 });
    const lastId = list[list.length-1].serviceEventId;
    const act = await getServiceEventDetail(lastId);
    const res = await auditServiceEvent({
        message: '测试审核',
        problemSummary: '测试审核',
        result: false,
        serviceEventId: lastId,
        serviceFormId: act.serviceForms[0].formID
    });
    console.log(res);
})