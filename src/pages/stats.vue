<script setup lang="ts">


import type { Ref } from 'vue';

import type { ServiceQuery, ServiceEvent } from '~/models/service';
import type { ActivityInfo } from '~/models/activity';
import type { User } from '~/models/user';

import { getActivityList } from '~/api/activity';

import { NForm, NFormItem, NSwitch, NSelect, NDatePicker, NInput, NButton, NStatistic, NIcon, NH3, NCard, NCollapseTransition, NNumberAnimation, NGi, NGrid, NDivider } from 'naive-ui';

import { handleError } from '~/composables/error';
import { getServiceEventList } from '~/api/service';

import { useHead } from '@vueuse/head';
import { useMessage, useLoadingBar } from 'naive-ui';
import { getVolunteerList } from '~/api/user';

import { parseDate, formatDate } from '~/composables/date';

import { useWindowSize } from '@vueuse/core';

import { SearchOutline, CloseOutline, FilterOutline, PeopleOutline } from '@vicons/ionicons5';
import { ChartRiver, DocumentExport, ToolKit } from '@vicons/carbon';

import { groupBy, countBy } from 'lodash';

import { Chart, registerables } from 'chart.js';
import { BarChart } from 'vue-chart-3';

import { writeFileXLSX, utils as XLSXutils } from "xlsx";

Chart.register(...registerables);
Chart.defaults.font.size = 14;

const router = useRouter();
const message = useMessage();
const loadingBar = useLoadingBar();

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

const getActivitiesAsync = async () => {
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

/* index + 1 is a ugly workaround to get volunteerId */
/* TODO refactor this when this API is fixed */
type Volunteer = User & {volunteerId: number};

const volunteerList: Ref<Volunteer[]> = ref([]);

const volunteerOptions = computed(() => {
    return volunteerList.value.map(volunteer => ({
        label: volunteer.userName + '(' + volunteer.studentId + ')',
        value: volunteer.volunteerId
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
        volunteerList.value = list.map((v, index) => ({
            ...v,
            volunteerId: index + 1
        }));
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
    loadingBar.start();
    try {
        serviceList.value = await getServiceEventList(q);
        console.log('service list refreshed', serviceList.value);
        loadingBar.finish();
    } catch (e: any) {
        handleError(e, message, router);
        loadingBar.error();
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

if (router.currentRoute.value.query){
    readQueryFromObj(router.currentRoute.value.query);
}
/* refresh if route changes */
watch(router.currentRoute, (newVal)=>{
    console.log('route changed', newVal);
    serviceQuery.value = {draft: false, closed: false};
    readQueryFromObj(router.currentRoute.value.query);
    doServiceListRefresh();
})

/* data magics */
const serviceByStatus = computed(() => groupBy(serviceList.value, 'status'));
const serviceByActivity = computed(() => groupBy(serviceList.value, 'activityName'));
const serviceByVolunteer = computed(() => groupBy(serviceList.value, 'volunteerName'))

const serviceByTimeSlot = computed(() => groupBy(serviceList.value, (v) => v.startTime + ' → ' + v.endTime));

const activityHoursSum = computed(() => {
    const activityNames = Object.keys(serviceByActivity.value);
    const hours = activityNames.map(activityName => {
        const act = nameToActivity.value[activityName];
        if (!act) return 0;
        return (parseDate(act.endTime) - parseDate(act.startTime)) / 3600000;
    });
    return Math.round(hours.reduce((a, b) => a + b, 0));
});

/* excel generator */

const generatingExcel = ref(false);

const volunteerData = computed(() => Object.entries(serviceByVolunteer.value).map(pair => {
    const [volunteerName, services] = pair;
    const serviceCount = services.length;
    const serviceFinishedCount = services.filter(item => item.status === 5).length;

    return {
        '姓名': volunteerName,
        '维修单数': serviceCount,
        '完成维修单数': serviceFinishedCount
    }
}).sort((a, b) => ((b.完成维修单数 - a.完成维修单数) * 8 +  b.维修单数 - a.维修单数))
    .filter(volunteer => volunteer.姓名 !== 'null'));

const activityData = computed(() => Object.entries(serviceByActivity.value).filter(([k,v]) => k !== "null").map(pair => {
    const [activityName, services] = pair;
    const activityInfo = nameToActivity.value[activityName];

    const serviceCount = services.length;
    const serviceCheckedCount = services.filter(item => [3, 4, 5].includes(item.status)).length;
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
}).sort((a,b) => a.ID - b.ID));

const timeSlotData = computed(() => Object.entries(serviceByTimeSlot.value).map(pair => {
    const [timeSlot, services] = pair;
    const serviceCount = services.length;
    const serviceCheckedCount = services.filter(item => [3, 4, 5].includes(item.status)).length;
    const serviceFinishedCount = services.filter(item => item.status === 5).length;
    const volunteersCount = Object.keys(countBy(services, 'volunteerName')).length;

        return {
        '时间段': timeSlot,
        '维修单数': serviceCount,
        '签到维修单数': serviceCheckedCount,
        '完成维修单数': serviceFinishedCount,
        '接单志愿者数': volunteersCount
    };
}).sort((a, b) => a.时间段.localeCompare(b.时间段)))

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
    '编辑中': service.draft ? '是' : '否',
    '已删除': service.closed ? '是' : '否'
})));

const generateExcel = () => {
    generatingExcel.value = true;
    try {
        /* generate filename from query */
        let fileName = '统计数据.xlsx';
        if (typeof (serviceQuery.value.status) !== 'undefined') {
            fileName = statusLabels[serviceQuery.value.status] + '_' + fileName;
        }
        if (serviceQuery.value.volunteer) {
            // volunteer name
            const idStr = serviceQuery.value.volunteer.toString();
            if (!Object.keys(idToVolunteer.value).includes(idStr)) throw new Error('Volunteer not in list ' + idStr);
            fileName = idToVolunteer.value[idStr].userName + '_' + fileName;
        }
        if (serviceQuery.value.activity) {
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

        /* timeslot */
        if(serviceQuery.value.activity) {
            const timeSlotSheet = XLSXutils.json_to_sheet(timeSlotData.value);
            XLSXutils.book_append_sheet(workBook, timeSlotSheet, '时间段');
        }

        /* services */
        const serviceSheet = XLSXutils.json_to_sheet(serviceData.value);
        XLSXutils.book_append_sheet(workBook, serviceSheet, '维修单')

        writeFileXLSX(workBook, fileName);
    } catch (e: any) {
        handleError(e, message, router, '导出Excel时发生错误');
        throw e;
    } finally {
        generatingExcel.value = false;
    }
}

/* charts */
const activityBarData = computed(() => ({
    labels: activityData.value.map(act => act.名称),
    datasets: [
        {
            label: '完成维修单数',
            data: activityData.value.map(act => act.完成维修单数),
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
        },
        {
            label: '签到维修单数',
            data: activityData.value.map(act => act.签到维修单数),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
        },
        {
            label: '维修单数',
            data: activityData.value.map(act => act.维修单数),
            backgroundColor: 'rgba(255, 206, 86, 0.7)',
        }
    ]
}))

const timeSlotBarData = computed(() => ({
    labels: timeSlotData.value.map(act => act.时间段),
    datasets: [
        {
            label: '完成维修单数',
            data: timeSlotData.value.map(act => act.完成维修单数),
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
        },
        {
            label: '签到维修单数',
            data: timeSlotData.value.map(act => act.签到维修单数),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
        },
        {
            label: '维修单数',
            data: timeSlotData.value.map(act => act.维修单数),
            backgroundColor: 'rgba(255, 206, 86, 0.7)',
        }
    ]
}))

/* setup task */
const setupTask = async () => {
    getActivitiesAsync();
    await getVolunteerListAsync();
    /* get service list on refresh */
    doServiceListRefresh();
}

setupTask();

</script>

<template>
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
                <chart-river />
            </n-icon>统计信息
        </n-h3>

        <div v-if="showServiceQuery" class="table-header-btn">
            <n-button
                type="warning"
                @click="generateExcel"
                class="query-btn"
                :loading="generatingExcel"
            >
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
            <n-button
                type="warning"
                @click="generateExcel"
                class="query-btn"
                :loading="generatingExcel"
            >
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

    <section class="stats-content">
        <n-card class="chart-card">
            <n-grid n-grid cols="2 600:3 900:6" x-gap="15" class="text-center">
                <n-gi>
                    <n-statistic label="志愿活动">
                        <n-number-animation
                            ref="numberAnimationInstRef"
                            :from="0"
                            :to="Object.keys(serviceByActivity).length"
                        />
                        <template #suffix>次</template>
                    </n-statistic>
                </n-gi>

                <n-gi>
                <n-statistic label="累积时长">
                    <n-number-animation
                        ref="numberAnimationInstRef"
                        :from="0"
                        :to="activityHoursSum"
                    />
                    <template #suffix>小时</template>
                </n-statistic>
                </n-gi>

                <n-gi>
                <n-statistic label="收到维修单">
                    <n-number-animation
                        ref="numberAnimationInstRef"
                        :from="0"
                        :to="serviceList.length"
                    />
                    <template #suffix>份</template>
                </n-statistic>
                </n-gi>

                <n-gi>
                    <n-statistic label="完成维修单">
                        <n-number-animation
                            ref="numberAnimationInstRef"
                            :from="0"
                            :to="Object.keys(serviceByStatus).includes('5') ? serviceByStatus['5'].length : 0"
                        />
                        <template #suffix>份</template>
                    </n-statistic>
                </n-gi>

                <n-gi>
                    <n-statistic label="注册志愿者">
                        <n-number-animation
                            ref="numberAnimationInstRef"
                            :from="0"
                            :to="volunteerList.length"
                        />
                        <template #suffix>人</template>
                    </n-statistic>
                </n-gi>

                <n-gi>
                    <n-statistic label="活跃志愿者">
                        <n-number-animation
                            ref="numberAnimationInstRef"
                            :from="0"
                            :to="Object.keys(serviceByVolunteer).length"
                        />
                        <template
                            #suffix
                        >人</template>
                    </n-statistic>
                </n-gi>
            </n-grid>
        </n-card>

        <n-card class="chart-card">
            <template #header>
                <n-h3 align-text class="table-header-text">
                    <n-icon class="mx-2" size="20">
                        <tool-kit />
                    </n-icon>维修单统计
                </n-h3>
            </template>
            <div class="m-auto">
                <bar-chart v-if="!serviceQuery.activity" :chart-data="activityBarData" />
                <bar-chart v-else :chart-data="timeSlotBarData" />
            </div>
        </n-card>

        <n-card class="chart-card">
            <template #header>
                <n-h3 align-text class="table-header-text">
                    <n-icon class="mx-2" size="20">
                        <people-outline />
                    </n-icon>志愿者统计
                </n-h3>
            </template>

            <n-grid cols="2 480:3 640:4 960:6 1440:9 1920:12" x-gap="15" y-gap="15" class="text-center">
                <n-gi v-for="(item, index) in volunteerData"
                    :key="index">
                    <router-link :to="{ name: 'stats', query: { volunteer: nameToVolunteer[item.姓名].volunteerId.toString()}}">
                        <n-card
                            class="volunteer-card"
                            :href="'/stats?volunteer=' + nameToVolunteer[item.姓名].volunteerId"
                        >
                        <template #header>
                            {{ item.姓名 }}
                        </template>
                            <n-statistic label="完成 / 接单">
                                {{ item.完成维修单数 }}
                                <template #suffix>
                                    / {{ item.维修单数 }}
                                </template>
                            </n-statistic>
                        </n-card>
                    </router-link>
                </n-gi>
            </n-grid >
        </n-card>

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

.volunteer-card {
    height: min-content;
    width: fit-content;
    min-width: 154px;
    text-align: center;
}

.stats-content {
    @apply flex flex-col justify-center items-center;
    gap: 15px;
    margin: 15px;
}

</style>