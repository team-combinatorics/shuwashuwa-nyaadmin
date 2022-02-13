<script setup lang="ts">


import type { Ref } from 'vue';

import type { ServiceQuery, ServiceEvent } from '~/models/service';
import type { ActivityInfo } from '~/models/activity';
import type { User } from '~/models/user';

import { getActivityList } from '~/api/activity';

import { NForm, NFormItem, NSwitch, NSelect, NDatePicker, NInput, NButton, NDataTable } from 'naive-ui';

import { handleError } from '~/composables/error';
import { groupBy } from '~/composables/utils';
import { getServiceEventList } from '~/api/service';

import { useHead } from '@vueuse/head';
import { useMessage } from 'naive-ui';
import { getVolunteerList } from '~/api/user';

import { parseDate, formatDate } from '~/composables/date';

const router = useRouter();
const message = useMessage();

useHead({
    title: '维修单 | 修哇修哇'
})

const activityLoading = ref(false);
const incomingActivities = ref<ActivityInfo[]>([]);
const activityOptions = computed(() => {
    return incomingActivities.value.map(activity => ({
        label: activity.activityName,
        value: activity.id
    }));
});

const getIncomingActivitiesAsync = async () => {
    activityLoading.value = true;
    try {
        const activities = await getActivityList({
            // endLower: formatDate(Date.now()),
        });
        /* sort by reverse id */
        incomingActivities.value = activities.sort((a, b) => b.id - a.id);
        console.log('incoming activities refreshed', activities);
    } catch (e: any) {
        handleError(e, message, router);
    } finally {
        activityLoading.value = false;
    }
}

const serviceQuery: Ref <ServiceQuery> = ref({
    closed: false,
    draft: false,
});

const volunteerLoading = ref(false);
const volunteerList: Ref<User[]> = ref([]);
const volunteerOptions = computed(() => {
    return volunteerList.value.map(volunteer => ({
        label: volunteer.userName + '(' + volunteer.studentId + ')',
        value: volunteer.userid
    }));
});

const getVolunteerListAsync = async () => {
    volunteerLoading.value = true;
    try {
        const list = await getVolunteerList();
        console.log('volunteer list refreshed', list);
        volunteerList.value = list;
    } catch (e: any) {
        handleError(e, message, router);
    } finally {
        volunteerLoading.value = false;
    }
}

const getDateRange = computed(() => {
    if(!serviceQuery.value.createLower || !serviceQuery.value.createUpper) {
        return null;
    }
    const start = parseDate(serviceQuery.value.createLower);
    const end = parseDate(serviceQuery.value.createUpper);
    return [start, end];
});

const setDateRange = (val: number[] | null) => {
    if(val === null || val.length !== 2) {
        serviceQuery.value.createLower = undefined;
        serviceQuery.value.createUpper = undefined;
        return;
    }
    const [start, end] = val;
    serviceQuery.value.createLower = formatDate(start);
    serviceQuery.value.createUpper = formatDate(end);
    console.log(serviceQuery.value);
}

/* read initial query from route params */

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
    
if(router.currentRoute.value.query){
    readQueryFromObj(router.currentRoute.value.query);
}

const serviceList: Ref <ServiceEvent[]> = ref([]);
const serviceListLoading = ref(false);

const getServiceListAsync = async (q: ServiceQuery) => {
    console.log(serviceQuery.value);
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

const formRef = ref(null as any);

const tableRef = ref(null as any);

const columns = [
    {
        title: '单号',
        key: 'serviceEventId',
        fixed: 'left',
        width: '60px',
    },
    {
        title: '状态',
        key: 'status',
    },
    {
        title: '活动',
        key: 'activityName',
    },
    {
        title: '电脑型号',
        key: 'computerModel',
    },
    {
        title: '问题描述',
        key: 'problemSummary',
    },
    {
        title: '志愿者',
        key: 'volunteerName',
    },
    {
        title: '客户',
        key: 'userName',
    },
    {
        title: '创建时间',
        key: 'createTime',
    },
    {
        title: '操作',
        key: 'action',
        width: '100px',
    },

    // activityName: string,
    // closed: boolean,
    // computerModel: string,
    // createTime: string,
    // draft: boolean,
    // endTime: string,
    // problemSummary: string,
    // serviceEventId: number,
    // startTime: string,
    // status: ServiceStatus,
    // userName: string,
    // volunteerName: string
];

const setupTask = async () => {
    getIncomingActivitiesAsync();
    getVolunteerListAsync();
    /* get service list on refresh */
    doServiceListRefresh();
}

setupTask();

</script>

<template>
    <div class="query-form">
        <n-form inline ref="formRef" :value="serviceQuery" >

            <n-form-item label="活动" path="activity">
                <n-select
                    v-model:value="serviceQuery.activity"
                    :options="activityOptions"
                    :loading="activityLoading"
                    placeholder="请选择/通过名称查询"
                    filterable
                    clearable
                />
            </n-form-item>
            <n-form-item label="志愿者" path="volunteer">
                <n-select
                    v-model:value="serviceQuery.volunteer"
                    :options="volunteerOptions"
                    :loading="volunteerLoading"
                    placeholder="请选择/通过姓名查询"
                    filterable
                    clearable
                />
            </n-form-item>
            <n-form-item label="客户" path="client">
                <n-input
                    :value="serviceQuery.client? String(serviceQuery.client) : ''"
                    @input="(v) => serviceQuery.client = v? Number(v) : undefined"
                    clearable
                    placeholder="请输入用户ID"
                />
            </n-form-item>
            <n-form-item label="创建时间" path="createLower">
                <n-date-picker
                    type="daterange"
                    clearable
                    placeholder="填写时间段"
                    input-readonly
                    :value="getDateRange"
                    :disabled="activityLoading"
                    :on-update:value="(v) => setDateRange(v)"
                />
            </n-form-item>
            <n-form-item label="草稿" path="draft">
                <n-switch v-model:value="serviceQuery.draft"/>
            </n-form-item>
            <n-form-item label="已删除" path="closed">
                <n-switch v-model:value="serviceQuery.closed"/>
            </n-form-item>

            <n-button type="primary" @click="doServiceListRefresh">查询</n-button>
        </n-form>
    </div>
    <div class="service-table">
                <!-- table -->
        <div class="table-container">
            <n-data-table
                ref="tableRef"
                :columns="columns"
                :data="serviceList"
                :loading="serviceListLoading"
                :scroll-x="1000"
                @sorter-change="doSort"
                striped
            />
        </div>
    </div>
</template>