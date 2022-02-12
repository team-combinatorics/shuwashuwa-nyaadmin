<script setup lang="ts">

import { useHead } from '@vueuse/head';
import { useMessage } from 'naive-ui';
import { Ref } from 'vue';

import type { ServiceQuery, ServiceEvent } from '~/models/service';

import { NForm, NFormItem, NSwitch, NInputNumber, NIcon, NH3, NImage, NImageGroup, NSpace } from 'naive-ui';

import { NGrid, NGridItem } from 'naive-ui';

import { handleError } from '~/composables/error';
import { groupBy } from '~/composables/utils';
import { getServiceEventList } from '~/api/service';

const router = useRouter();
const message = useMessage();

useHead({
    title: '维修单 | 修哇修哇'
})

const defaultServiceQuery: ServiceQuery = {
    closed: false,
    draft: false,
}

const serviceQuery: Ref <ServiceQuery> = ref(defaultServiceQuery);

const readQueryFromObj = (obj: any) => {
    if ('status' in Object.keys(obj)) { serviceQuery.value.status = obj.status; }
    if ('activity' in Object.keys(obj)) { serviceQuery.value.activity = obj.activity; }
    if ('client'  in Object.keys(obj)) { serviceQuery.value.client = obj.client; }
    if ('closed'  in Object.keys(obj)) { serviceQuery.value.closed = obj.closed; }
    if ('draft' in Object.keys(obj)) { serviceQuery.value.draft = obj.draft; }
    if ('volunteer' in Object.keys(obj)) { serviceQuery.value.volunteer = obj.volunteer;}
    if ('createLower' in Object.keys(obj)) { serviceQuery.value.createLower = obj.createLower; }
    if ('createUpper' in Object.keys(obj)) { serviceQuery.value.createUpper = obj.createUpper;}
}

/* read initial query from route params */
    
if(router.currentRoute.value.query){
    readQueryFromObj(router.currentRoute.value.query);
}

const serviceList: Ref <ServiceEvent[]> = ref([]);
const serviceListLoading = ref(false);

const serviceListGrouped = computed(() => groupBy(serviceList.value, 'status'));

const getServiceListAsync = async (q: ServiceQuery) => {
    serviceListLoading.value = true;
    try {
        serviceList.value = await getServiceEventList(q);
        console.log('service list refreshed', serviceList.value);
    } catch (e: any) {
        handleError(e, message, router);
    } finally {
        serviceListLoading.value = false;
    }
}

const doServiceListRefresh = async () => await getServiceListAsync(serviceQuery.value);

/* get service list on refresh */
doServiceListRefresh();

/* service form */
const formRef = ref(null as any);

</script>

<template>
    <div class="query-form">
        <n-form inline :value="serviceQuery">
            <n-form-item label="草稿" path="draft">
                <n-switch v-model:value="serviceQuery.draft"/>
            </n-form-item>
            <n-form-item label="删除的维修单" path="closed">
                <n-switch v-model:value="serviceQuery.closed"/>
            </n-form-item>
            <n-form-item label="活动ID" path="activity">
                <n-input-number v-model:value="serviceQuery.activity" placeholder="活动ID" />
            </n-form-item>
        </n-form>
    </div>
</template>