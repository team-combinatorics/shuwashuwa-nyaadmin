<script setup lang="ts">


import type { Ref } from 'vue';

import type { ServiceQuery, ServiceEvent, ServiceEventDetail } from '~/models/service';
import type { ActivityInfo } from '~/models/activity';
import type { User } from '~/models/user';

import { getActivityList } from '~/api/activity';

import { NForm, NFormItem, NSwitch, NSelect, NDatePicker, NInput, NButton, NDataTable, NIcon, NH3, NText, NCollapseTransition, NDrawer, DataTableColumns } from 'naive-ui';

import { handleError } from '~/composables/error';
import { getServiceEventList, getServiceEventDetail } from '~/api/service';

import { useHead } from '@vueuse/head';
import { useMessage, useLoadingBar } from 'naive-ui';
import { getVolunteerList } from '~/api/user';

import { parseDate, formatDate } from '~/composables/date';
import { tablePagination } from '~/composables/table-pagination';

import { SearchOutline, CloseOutline, FilterOutline } from '@vicons/ionicons5';
import { Information as InformationIcon, Edit as EditIcon, ToolKit as ToolKitIcon } from '@vicons/carbon';

import ServiceDrawer from '~/components/ServiceDrawer.vue';

import { useWindowSize } from '@vueuse/core';

const router = useRouter();
const message = useMessage();

useHead({
    title: '维修单 | 修哇修哇'
})

const windowSize = useWindowSize();

const useMobileLayout = computed(() => {
    return windowSize.width.value <= 705;
})

const drawerWidth = computed(() => {
    // make it possible to close
    return useMobileLayout.value ? windowSize.width.value * 0.85 : 600;
})

const loadingBar = useLoadingBar();

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

const serviceQuery: Ref<ServiceQuery> = ref({
    closed: false,
    draft: false,
});
const showServiceQuery = ref(false);

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

const pageOptions = { pageSize: 10 };

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

const statusColorType = (status: number) => {
    switch (status) {
        case 0:
            return 'info';
        case 5:
            return 'error';
        case 1:
        case 2:
            return 'warning';
        case 3:
        case 4:
            return 'success';
        default:
            console.log('undefined service status', status);
            return 'default';
    }
}

const getVolunteerListAsync = async () => {
    try {
        const list = await getVolunteerList();
        console.log('volunteer list refreshed', list);
        volunteerList.value = list.map((v, index) => ({
            ...v,
            volunteerId: index + 1
        }));
    } catch (e: any) {
        handleError(e, message, router);
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
        serviceList.value.sort((a, b) => b.serviceEventId - a.serviceEventId);
        console.log('service list refreshed', serviceList.value);
        loadingBar.finish();

        tablePagination.page = 1;  // set page to 1 when query is changed
    } catch (e: any) {
        handleError(e, message, router);
        loadingBar.error();
    } finally {
        serviceListLoading.value = false;
    }
}

const doServiceListRefresh = async () => await getServiceListAsync(serviceQuery.value);

/* service detail */
const editingService: Ref<ServiceEventDetail | null> = ref(null);
const showDrawer = ref(false);

const getServiceEventDetailAsync = async (id: number) => {
    serviceListLoading.value = true;
    try {
        const detail = await getServiceEventDetail(id);
        editingService.value = detail;
        console.log('service detail refreshed', detail);
    } catch (e: any) {
        handleError(e, message, router);
    } finally {
        serviceListLoading.value = false;
    }
}

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
    // shortcut 
    if (Object.keys(obj).includes('id')) {
        const id = Number(obj.id);
        getServiceEventDetailAsync(id)
            .then(()=>{showDrawer.value = true;})
    }
}

if (router.currentRoute.value.query) {
    readQueryFromObj(router.currentRoute.value.query);
}

const formRef = ref(null as any);

const tableRef = ref(null as any);

const columns: DataTableColumns<ServiceEvent> = [
    {
        title: 'ID',
        key: 'serviceEventId',
        width: '60px',
    },
    {
        title: '状态',
        key: 'status',
        width: '80px',
        render: (row: ServiceEvent) => {
            return h(NText, {
                type: statusColorType(row.status),
            }, () => statusLabels[row.status]);
        }
    },
    {
        title: '活动',
        key: 'activityName',
        ellipsis: {
            tooltip: true
        }
    },
    {
        title: '电脑型号',
        key: 'computerModel',
        ellipsis: {
            tooltip: true
        }
    },
    {
        title: '问题描述',
        key: 'problemSummary',
        ellipsis: {
            tooltip: true
        },
    },
    {
        title: '志愿者',
        key: 'volunteerName',
        width: '100px',
    },
    {
        title: '客户',
        key: 'userName',
        width: '100px',
    },
    {
        title: '时间段',
        key: 'timeslot',
        width: '160px',
        render: (row: ServiceEvent) => {
            return h(NText, {}, () => row.startTime ? row.startTime?.split(' ')[1] + ' → ' + row.endTime?.split(' ')[1] : '');
        }
    },
    {
        title: '创建时间',
        key: 'createTime',
        width: '160px',
    },
    {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: '60px',
        render: (row: ServiceEvent) => h(
            NButton,
            {
                strong: true,
                tertiary: true,
                size: 'small',
                type: row.status === 1 ? 'primary' : 'default',
                onClick: async () => {
                    await getServiceEventDetailAsync(row.serviceEventId);
                    showDrawer.value = true;
                    // message.info('编辑服务' + row.serviceEventId);
                }
            },
            {
                icon: () => h(NIcon,
                    {},
                    { default: () => row.status === 1 ? h(EditIcon) : h(InformationIcon) }
                )
            }
        )
    },
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
                        :loading="activityLoading"
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
    </section>

    <section class="service-table">
        <div class="table-header">
            <n-h3 prefix="bar" align-text class="table-header-text">
                <n-icon class="mx-2" size="20">
                    <tool-kit-icon />
                </n-icon>维修单列表
            </n-h3>

            <div v-if="showServiceQuery" class="table-header-btn">
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

        <div class="table-container">
            <n-data-table
                ref="tableRef"
                :columns="columns"
                :data="serviceList"
                :loading="serviceListLoading"
                :scroll-x="1000"
                striped
                :pagination="tablePagination"
                show-size-picker
            />
        </div>
    </section>

    <ServiceDrawer
        v-if="editingService !== null"
        :service="editingService"
        v-model:show="showDrawer"
    />
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

</style>