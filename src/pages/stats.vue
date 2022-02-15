<script setup lang="ts">


import type { Ref } from 'vue';

import type { ServiceQuery, ServiceEvent, ServiceEventDetail } from '~/models/service';
import type { ActivityInfo } from '~/models/activity';
import type { User } from '~/models/user';

import { getActivityList } from '~/api/activity';

import { NForm, NFormItem, NSwitch, NSelect, NDatePicker, NInput, NButton, NDataTable, NIcon, NH3, NText, NCollapseTransition, NDrawer } from 'naive-ui';

import { handleError } from '~/composables/error';
import { getServiceEventList, getServiceEventDetail } from '~/api/service';

import { useHead } from '@vueuse/head';
import { useMessage } from 'naive-ui';
import { getVolunteerList } from '~/api/user';

import { parseDate, formatDate } from '~/composables/date';

import { useWindowSize } from '@vueuse/core';

import { SearchOutline, CloseOutline, FilterOutline } from '@vicons/ionicons5';
import { ChartRiver, DocumentExport, ObjectStorage } from '@vicons/carbon';

import { groupBy, countBy, mapValues } from 'lodash';

import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { BarChart, useBarChart } from 'vue-chart-3';

import { writeFileXLSX, utils as XLSXutils } from "xlsx";

Chart.register(...registerables);

const router = useRouter();
const message = useMessage();

useHead({
    title: '统计 | 修哇修哇'
})

const windowSize = useWindowSize();

const useMobileLayout = computed(() => {
    return windowSize.width.value <= 705;
})

const activityLoading = ref(false);
const activityList = ref<ActivityInfo[]>([]);
/* build dicts to speed up find */
const idToActivity = computed(() => Object.fromEntries(
    activityList.value.map(v => [v.id, v])
))
const nameToActivity = computed(() => Object.fromEntries(
    activityList.value.map(v => [v.activityName, v])
))


/* query panel */
const activityOptions = computed(() => {
    return activityList.value.map(activity => ({
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
        activityList.value = activities.sort((a, b) => b.id - a.id);
        console.log('incoming activities refreshed', activities);
    } catch (e: any) {
        handleError(e, message, router);
    } finally {
        activityLoading.value = false;
    }
}

const serviceQuery: Ref<ServiceQuery> = ref({
    closed: false,
    draft: false,
});
const showServiceQuery = ref(false);

const volunteerLoading = ref(false);
const volunteerList: Ref<User[]> = ref([]);
const volunteerOptions = computed(() => {
    return volunteerList.value.map(volunteer => ({
        label: volunteer.userName + '(' + volunteer.studentId + ')',
        value: volunteer.userid
    }));
});

/* build dicts to speedup find */
const idToVolunteer = computed(() => Object.fromEntries(
    volunteerList.value.map(v => [v.userid, v])
))
const nameToVolunteer = computed(() => Object.fromEntries(
    volunteerList.value.map(v => [v.userName, v])
))

const statusLabels = [
    '编辑中',
    '待审核',
    '待签到',
    '待接单',
    '维修中',
    '已完成',
];

const statusOptions = statusLabels.map((label, index) => ({
    label,
    value: index
}));

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
    if (!serviceQuery.value.createLower || !serviceQuery.value.createUpper) {
        return null;
    }
    const start = parseDate(serviceQuery.value.createLower);
    const end = parseDate(serviceQuery.value.createUpper);
    return [start, end];
});

const setDateRange = (val: number[] | null) => {
    if (val === null || val.length !== 2) {
        serviceQuery.value.createLower = undefined;
        serviceQuery.value.createUpper = undefined;
        return;
    }
    const [start, end] = val;
    serviceQuery.value.createLower = formatDate(start);
    serviceQuery.value.createUpper = formatDate(end);
    console.log(serviceQuery.value);
}

/* service list */
const serviceList: Ref<ServiceEvent[]> = ref([]);
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

/* read initial query from route params */
const readQueryFromObj = (obj: any) => {
    console.log('read query from obj', obj);
    if (Object.keys(obj).includes('activity')) { serviceQuery.value.activity = Number(obj.activity); }
    if (Object.keys(obj).includes('status')) { serviceQuery.value.status = Number(obj.status); }
    if (Object.keys(obj).includes('createLower')) { serviceQuery.value.createLower = obj.createLower; }
    if (Object.keys(obj).includes('createUpper')) { serviceQuery.value.createUpper = obj.createUpper; }
    if (Object.keys(obj).includes('draft')) { serviceQuery.value.draft = Boolean(obj.draft); }
    if (Object.keys(obj).includes('closed')) { serviceQuery.value.closed = Boolean(obj.closed); }
    if (Object.keys(obj).includes('client')) { serviceQuery.value.client = Number(obj.client); }
    if (Object.keys(obj).includes('volunteer')) { serviceQuery.value.volunteer = Number(obj.volunteer); }
}

if (router.currentRoute.value.query) {
    readQueryFromObj(router.currentRoute.value.query);
}

/* data magics */
const serviceByStatus = computed (() => groupBy(serviceList.value, 'status'));
const serviceCountByStatus = computed(() => mapValues(serviceByStatus.value, v => v.length));
const serviceByActivity = computed (() => groupBy(serviceList.value, 'activityName'));
const serviceCountByActivity = computed (() => mapValues(serviceByActivity.value, v => v.length));
const serviceByVolunteer = computed (() => groupBy(serviceList.value, 'volunteerName'))
const serviceCountByVolunteer = computed (() => mapValues(serviceByVolunteer.value, v => v.length));

const generatingExcel = ref(false);

const volunteerData = computed(() => Object.entries(serviceByVolunteer.value).map(pair => {
    const [volunteerName, services] = pair;
    const serviceCount = services.length;
    const serviceFinishedCount = services.filter(item => item.status === 5).length;

    return {
        '姓名': volunteerName === 'null' ? '<未接单>': volunteerName,
        '维修单数': serviceCount,
        '完成维修单数': serviceFinishedCount
    }
}))

const activityData = computed(() => Object.entries(serviceByActivity.value).map(pair => {
    const [activityName, services] = pair;
    const activityInfo = nameToActivity.value[activityName];
    
    const serviceCount = services.length;
    const serviceCheckedCount = services.filter(item => [2,3,4,5].includes(item.status)).length;
    const serviceFinishedCount = services.filter(item => item.status === 5).length;

    const volunteersCount = Object.keys(countBy(services, 'volunteerName')).length;

    return {
        'ID': activityInfo.id,
        '名称': activityInfo.activityName,
        '地点': activityInfo.location,
        '开始时间': activityInfo.startTime,
        '结束时间': activityInfo.endTime,
        '维修单数': serviceCount,
        '签到维修单数': serviceCheckedCount,
        '完成维修单数': serviceFinishedCount,
        '接单志愿者数': volunteersCount
    };
}))

const serviceData = computed(() => serviceList.value.map(service => ({
        'ID': service.serviceEventId,
        '状态': statusLabels[service.status],
        '活动': service.activityName,
        '开始时间': service.startTime,
        '结束时间': service.endTime,
        '客户': service.userName,
        '志愿者': service.volunteerName,
        '电脑型号': service.computerModel,
        '故障描述': service.problemSummary,
        '编辑中': service.draft? '是': '否',
        '已删除': service.closed? '是': '否'
})));

const generateExcel = () => {
    generatingExcel.value = true;
    try {
        /* generate filename from query */
        let fileName = '统计数据.xlsx';
        if (typeof(serviceQuery.value.status) !== 'undefined'){
            fileName = statusLabels[serviceQuery.value.status] + '_' + fileName;
        }
        if (serviceQuery.value.volunteer){
            // volunteer name
            const idStr = serviceQuery.value.volunteer.toString();
            if (!Object.keys(idToVolunteer.value).includes(idStr)) throw new Error('Volunteer not in list ' + idStr);
            fileName = idToVolunteer.value[idStr].userName + '_' + fileName;
        }
        if (serviceQuery.value.activity){
            // activity name
            const idStr = serviceQuery.value.activity.toString();
            if (!Object.keys(idToActivity.value).includes(idStr)) throw new Error('Activity not in list ' + idStr);
            fileName = idToActivity.value[idStr].activityName + '_' + fileName;
        }

        const workBook = XLSXutils.book_new();

        /* volunteers */
        const volunteerSheet = XLSXutils.json_to_sheet(volunteerData.value);
        XLSXutils.book_append_sheet(workBook, volunteerSheet, '志愿者');
        
        /* activities */
        const activitySheet = XLSXutils.json_to_sheet(activityData.value);
        XLSXutils.book_append_sheet(workBook, activitySheet, '活动');

        /* services */
        const serviceSheet = XLSXutils.json_to_sheet(serviceData.value);
        XLSXutils.book_append_sheet(workBook, serviceSheet, '维修单')    

        writeFileXLSX(workBook, fileName);
    } catch (e: any){
        handleError(e, message, router, '导出Excel时发生错误');
        throw e;
    } finally {
        generatingExcel.value = false;
    }
}

/* charts */
const activityBarData = computed(() => ({
    labels: activityList.value.map(item => item.activityName),
    datasets: [
        {
            label: '完成维修单数',
            data: activityData.value.map(act => act.完成维修单数),
            backgroundColor: 'red'
        },
        {
            label: '签到维修单数',
            data: activityData.value.map(act => act.签到维修单数),
            backgroundColor: 'yellow'
        },
        {
            label: '维修单数',
            data: activityData.value.map(act => act.维修单数),
            backgroundColor: 'green'
        }
    ]
}))

const { barChartProps } = useBarChart({
    chartData: activityBarData.value,
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Chart.js Bar Chart - Stacked'
            },
        },
        responsive: true,
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true
            }
        }
    }
})

/* setup task */
const setupTask = async () => {
    getIncomingActivitiesAsync();
    getVolunteerListAsync();
    /* get service list on refresh */
    doServiceListRefresh();
}

setupTask();

</script>

<template>
    <section>
        <n-collapse-transition :show="showServiceQuery" class="service-header">
            <n-form inline ref="formRef" :value="serviceQuery" class="query-form">
                <n-form-item label="状态" path="status">
                    <n-select
                        v-model:value="serviceQuery.status"
                        :options="statusOptions"
                        placeholder="请选择"
                        filterable
                        clearable
                    />
                </n-form-item>
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
                        :value="serviceQuery.client ? String(serviceQuery.client) : ''"
                        @input="(v) => serviceQuery.client = v ? Number(v) : undefined"
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
                        :value="(getDateRange as any)"
                        :disabled="activityLoading"
                        :on-update:value="(v) => setDateRange(v)"
                    />
                </n-form-item>
                <n-form-item label="草稿" path="draft">
                    <n-switch v-model:value="serviceQuery.draft" />
                </n-form-item>
                <n-form-item label="已删除" path="closed">
                    <n-switch v-model:value="serviceQuery.closed" />
                </n-form-item>
            </n-form>
        </n-collapse-transition>

        <div class="table-header">
            <n-h3 prefix="bar" align-text class="table-header-text">
                <n-icon class="mx-2" size="20">
                    <chart-river/>
                </n-icon>统计信息
            </n-h3>

        <div v-if="showServiceQuery" class="table-header-btn">
                <n-button type="warning" @click="generateExcel" class="query-btn" :loading="generatingExcel">
                    <template #icon>
                        <n-icon>
                            <document-export />
                        </n-icon>
                    </template>
                    导出Excel
                </n-button>
                <n-button type="error" @click="showServiceQuery = false" class="query-btn">
                    <template #icon>
                        <n-icon>
                            <close-outline />
                        </n-icon>
                    </template>
                    关闭
                </n-button>
                <n-button type="primary" @click="doServiceListRefresh" class="query-btn">
                    <template #icon>
                        <n-icon>
                            <search-outline />
                        </n-icon>
                    </template>
                    查询
                </n-button>
            </div>

            <div v-else class="table-header-btn">
                <n-button type="warning" @click="generateExcel" class="query-btn" :loading="generatingExcel">
                    <template #icon>
                        <n-icon>
                            <document-export />
                        </n-icon>
                    </template>
                    导出Excel
                </n-button>
                <n-button type="primary" @click="showServiceQuery = true" class="query-btn">
                    <template #icon>
                        <n-icon>
                            <filter-outline />
                        </n-icon>
                    </template>
                    筛选
                </n-button>
            </div>
        </div>

        <bar-chart v-bind="barChartProps"/>
    </section>
</template>

<style scoped>
/* local styles */
.service-header {
    @apply m-5 flex justify-center;
}

.query-form {
    @apply flex justify-center items-center;
    flex-wrap: wrap;
}

/* really wide screens */
@media screen and (min-width: 1250px) {
    .service-table {
        width: 80%;
        margin: auto;
    }
}
</style>

<style>
/* global styles */
.table-header {
    @apply flex justify-between items-center;
}

.n-h.table-header-text.n-h--prefix-bar::before {
    background-color: #555;
}

.n-h:first-child.table-header-text {
    @apply flex items-center ml-2;
    margin: 15px;
    margin-left: 23px;
    flex: none;
}

.table-header-btn {
    @apply flex items-center;
    margin: 15px;
    gap: 15px;
    flex: none;
}

.drawer-btn {
    width: 100%;
    text-align: center;
}
</style>