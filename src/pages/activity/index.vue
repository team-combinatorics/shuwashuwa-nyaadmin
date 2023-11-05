<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { useWindowSize } from '@vueuse/core';

import type { Ref } from 'vue';
import type { TimeSlot, Activity, ActivityInfo } from '~/models/activity';
import type { SortState } from 'naive-ui/lib/data-table/src/interface';

import { deleteActivity, addActivity, updateActivity, getActivityList, getActivityTimeSlots } from '~/api/activity';
import { tablePagination } from '~/composables/table-pagination';

import { handleError } from '~/composables/error';

import { NDataTable, NButton, NIcon, NDrawer, NDrawerContent, NForm, NFormItem, NInput, NPopconfirm, NDatePicker, NH3, NDynamicInput, NInputNumber } from 'naive-ui';
import { useMessage, useLoadingBar } from 'naive-ui';

import { formatDate, parseDate, splitTimeSlots } from '~/composables/date';

import { Edit } from '@vicons/carbon';
import { AddOutline, ListOutline } from '@vicons/ionicons5';

import ActivityShowcase from '~/components/ActivityShowcase.vue';


useHead({
    title: '活动 | 修哇修哇'
})

/* make it responsive */
const windowSize = useWindowSize();

const useMobileLayout = computed(() => {
    return windowSize.width.value <= 590;
})

const drawerWidth = computed(() => {
    // make it possible to close
    return useMobileLayout.value ? windowSize.width.value * 0.85 : 500;
})

const message = useMessage();
const router = useRouter();
const loadingBar = useLoadingBar();

const activityList: Ref<ActivityInfo[]> = ref([]);
const activityLoading = ref(false);
const activityListLoading = ref(false);

const incomingActivityList = computed((): ActivityInfo[] => {
    return activityList.value.filter(activity => parseDate(activity.endTime) > Date.now());
})

const getActivityListAsync = async () => {
    if (activityListLoading.value) return;  /* skip repeated requests */
    activityListLoading.value = true;
    loadingBar.start();
    try {
        const list = await getActivityList();
        activityList.value = list;
        console.log('activity list refreshed', list);
        activityList.value.sort((a, b) => b.id - a.id);
        loadingBar.finish();
    } catch (e: any) {
        handleError(e, message, router);
        loadingBar.error();
    } finally {
        activityListLoading.value = false;
    }
}

const nowStr = formatDate(Date.now());

const defaultEditingActivity: Activity = {
    activityName: '',
    location: '',
    startTime: nowStr,
    endTime: nowStr,
    timeSlots: [],
}

/* add or edit */

const isEditing = ref(false);
const editingActivity = ref<Activity>(defaultEditingActivity);
// const { startTime, endTime, timeSlots } = toRefs(editingActivity.value);
const editingActivityUrl = computed(() => '/activity/' + editingActivity.value.activityId);
const goToActivity = () => router.push(editingActivityUrl.value);

const serviceUrl = computed(() => '/service?activity=' + editingActivity.value.activityId);
const goToService = () => router.push(serviceUrl.value);

const statsUrl = computed(() => '/stats?activity=' + editingActivity.value.activityId);
const goToStats = () => router.push(statsUrl.value);

const activityIdComputed = computed(() => {
    if (editingActivity.value.activityId) {
        return editingActivity.value.activityId.toString();
    } else {
        return '';
    }
});

const doAddActivity = () => {
    isEditing.value = true;
    editingActivity.value = defaultEditingActivity;
}

const getActivityAsync = async (actinfo: ActivityInfo) => {
    activityLoading.value = true;

    const act: Activity = {
        activityId: actinfo.id,
        activityName: actinfo.activityName,
        location: actinfo.location,
        startTime: actinfo.startTime,
        endTime: actinfo.endTime,
        timeSlots: []
    }

    try {
        const timeSlots = await getActivityTimeSlots(actinfo.id);
        act.timeSlots = timeSlots;
    } catch (e: any) {
        handleError(e, message, router);
    } finally {
        activityLoading.value = false;
    }

    return act;
}

const doEditActivity = async (actinfo: ActivityInfo) => {
    isEditing.value = true;
    editingActivity.value = await getActivityAsync(actinfo);
}

const submitActivityAsync = async (act: Activity) => {
    if (activityLoading.value) return;  /* skip repeated requests */
    activityLoading.value = true;
    try {
        if ("activityId" in act) {
            console.log('update activity', act);
            await updateActivity(act);
            message.success('活动已更新');
        } else {
            console.log('add activity', act);
            await addActivity(act);
            message.success('活动已添加');
        }
        getActivityListAsync();
    } catch (e: any) {
        handleError(e, message, router);
    } finally {
        activityLoading.value = false;
    }
}

const doSubmitActivity = () => {
    formRef.value.validate(async (errors: any) => {
        if (errors) {
            message.error('请检查表单');
            return;
        }
        else {
            submitActivityAsync(editingActivity.value)
                .then(() => {
                    getActivityListAsync();
                })
            isEditing.value = false;
            editingActivity.value = defaultEditingActivity;
        }
    });
}

/* timeslots */

/* generate next timeslot with intelligence */
const generateNewTimeSlot = (): TimeSlot => {
    const len = editingActivity.value.timeSlots.length;
    if (len === 0) {
        return {
            timeSlot: editingActivity.value.timeSlots.length,
            startTime: editingActivity.value.startTime,
            endTime: editingActivity.value.startTime,
        }
    }
    const lastTimeSlot = editingActivity.value.timeSlots[len - 1];

    /* next timeslot starts at the end of last timeslot */
    const nextTimeSlotStartTime = lastTimeSlot.endTime;
    /* next timeslot ends after the same interval */
    const interval = parseDate(lastTimeSlot.endTime) - parseDate(lastTimeSlot.startTime);
    const lastTimeSlotEndTime = parseDate(lastTimeSlot.endTime);
    const endTime = parseDate(editingActivity.value.endTime);
    const nextTimeSlotEndTime = lastTimeSlotEndTime + interval > endTime ? formatDate(endTime) : formatDate(lastTimeSlotEndTime + interval);

    return {
        timeSlot: lastTimeSlot.timeSlot + 1,
        startTime: nextTimeSlotStartTime,
        endTime: nextTimeSlotEndTime
    }
}

const timeSlotInterval = ref(30);

const doSplitTimeSlots = () => {
    const interval = parseDate(editingActivity.value.endTime) - parseDate(editingActivity.value.startTime);
    if (interval < timeSlotInterval.value * 60 * 1000) {
        message.error('活动时间小于设定的时间间隔');
        return;
    }
    if (interval > 24 * 60 * 60 * 1000) {
        message.error('活动时间超过24小时');
        return;
    }
    editingActivity.value.timeSlots = splitTimeSlots(
        editingActivity.value.startTime,
        editingActivity.value.endTime,
        timeSlotInterval.value
    );
}

/* delete */

const deleteActivityAsync = async (act: Activity) => {
    if (!("activityId" in act)) return;  /* add activity */

    if (activityLoading.value) return;  /* skip repeated requests */
    activityLoading.value = true;

    try {
        await deleteActivity(act.activityId as any);
        getActivityListAsync();
    } catch (e: any) {
        handleError(e, message, router);
    } finally {
        activityLoading.value = false;
    }
}

const doDeleteActivity = () => {
    if (editingActivity.value.activityName === defaultEditingActivity.activityName) return;

    deleteActivityAsync(editingActivity.value)
        .then(() => {
            /* refresh activity list */
            getActivityListAsync()
        })

    isEditing.value = false;
    editingActivity.value = defaultEditingActivity;
}

/* sort */

const doSort = async (sorter: SortState) => {
    if (!sorter) {
        return activityList.value.sort((a, b) => b.id - a.id);
    }
    const { columnKey, order } = sorter;
    if (columnKey === 'id') {
        if (order === 'ascend') {
            activityList.value.sort((a, b) => a.id - b.id);
        } else {
            activityList.value.sort((a, b) => b.id - a.id);
        }
    } else if (columnKey === 'startTime') {
        if (order === 'ascend') {
            activityList.value.sort((a, b) => parseDate(a.startTime) - parseDate(b.startTime));
        } else {
            activityList.value.sort((a, b) => parseDate(b.startTime) - parseDate(a.startTime));
        }
    } else if (columnKey === 'endTime') {
        if (order === 'ascend') {
            activityList.value.sort((a, b) => parseDate(a.endTime) - parseDate(b.endTime));
        } else {
            activityList.value.sort((a, b) => parseDate(b.endTime) - parseDate(a.endTime));
        }
    } else if (columnKey === 'updatedTime') {
        if (order === 'ascend') {
            activityList.value.sort((a, b) => parseDate(a.updatedTime) - parseDate(b.updatedTime));
        } else {
            activityList.value.sort((a, b) => parseDate(b.updatedTime) - parseDate(a.updatedTime));
        }
    }
}

/* table */
const columns = [
    {
        title: 'ID',
        key: 'id',
        width: '60px',
        sorter: true,
        sortOrder: true,
    },
    {
        title: '名称',
        key: 'activityName',
        width: '180px',
        ellipsis: {
            tooltip: true
        },
    },
    {
        title: '地点',
        key: 'location',
        ellipsis: {
            tooltip: true
        },
    },
    {
        title: '开始时间',
        key: 'startTime',
        ellipsis: {
            tooltip: true
        },
        sorter: true,
        sortOrder: true,
    },
    {
        title: '结束时间',
        key: 'endTime',
        ellipsis: {
            tooltip: true
        },
        sorter: true,
        sortOrder: true,
    },
    {
        title: '编辑时间',
        key: 'updatedTime',
        ellipsis: {
            tooltip: true
        },
        sorter: true,
        sortOrder: true,
    },
    {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: '60px',
        render: (row: ActivityInfo) => h(
            NButton,
            {
                strong: true,
                tertiary: true,
                size: 'small',
                onClick: () => doEditActivity(row)
            },
            {
                default: () => h(NIcon,
                    {},
                    { default: () => h(Edit) }
                )
            }
        )
    }
]

const formRef: Ref = ref(null);
const formRules = {
    activityName: {
        required: true,
        message: '请输入名称',
        trigger: 'blur'
    },
    location: {
        required: true,
        message: '请输入地点',
        trigger: 'blur'
    },
    startTime: {
        required: true,
        message: '请输入开始时间',
        trigger: 'blur'
    },
    endTime: {
        required: true,
        message: '请输入结束时间',
        trigger: 'blur'
    },
    timeSlots: {
        trigger: 'blur',
        validator: (rule: any, value: any) => {
            if (value.length === 0) {
                return new Error('请输入时间段');
            } else {
                for (let slot of value) {
                    if (parseDate(slot.startTime) >= parseDate(slot.endTime)) {
                        return new Error('时间段不合法');
                    }
                }
            }
            return Promise.resolve();
        }
    },
};

/* get activity list on setup */
getActivityListAsync().then(() => {
    /* shortcut */
    if (router.currentRoute.value.query.activity){
        const activityId = Number(router.currentRoute.value.query.activity);
        const actInfo = activityList.value.find(act => act.id === activityId);
        if (actInfo) {
            doEditActivity(actInfo);
        }
    }
});
</script>

<template>
    <div class="page-container">
        <!-- activity showcase -->
        <div v-if="incomingActivityList.length > 0">
            <ActivityShowcase :activities="incomingActivityList"></ActivityShowcase>
        </div>

        <!-- table header -->
        <div class="table-header">
            <n-h3 prefix="bar" align-text class="table-header-text">
                <n-icon class="mx-2" size="20">
                    <list-outline />
                </n-icon>
                活动列表
            </n-h3>

            <div class="table-header-btn">
                <n-button :disabled="isEditing" @click="doAddActivity" type="primary">
                    <n-icon size="18" class="mr-1">
                        <add-outline />
                    </n-icon>添加活动
                </n-button>
            </div>
        </div>

        <!-- table -->
        <div class="table-container">
            <n-data-table
                ref="table"
                :columns="columns"
                :data="activityList"
                :loading="activityListLoading"
                :scroll-x="1000"
                @update-sorter="doSort"
                :pagination="tablePagination"
                striped
            />
        </div>
    </div>

    <!-- editDrawer -->
    <n-drawer
        placement="right"
        :auto-focus="false"
        v-model:show="isEditing"
        close-on-esc
        :width="drawerWidth"
    >
        <n-drawer-content title="编辑活动">
            <n-form ref="formRef" :model="editingActivity" :rules="formRules">
                <n-form-item v-if="activityIdComputed" label="ID" path="activityId">
                    <n-input
                        :disabled="true"
                        :value="activityIdComputed"
                        :loading="activityLoading"
                    />
                </n-form-item>
                <n-form-item label="名称" path="activityName">
                    <n-input
                        v-model:value="editingActivity.activityName"
                        :loading="activityLoading"
                        placeholder="MM月dd日电脑小队"
                    />
                </n-form-item>
                <n-form-item label="地点" path="location">
                    <n-input
                        v-model:value="editingActivity.location"
                        :loading="activityLoading"
                        placeholder="理教107"
                    />
                </n-form-item>
                <n-form-item label="开始时间" path="startTime">
                    <n-date-picker
                        class="timeslot-picker"
                        v-model:formatted-value="editingActivity.startTime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        type="datetime"
                        placeholder="选择开始时间"
                        :disabled="activityLoading"
                        input-readonly
                    />
                </n-form-item>
                <n-form-item label="结束时间" path="endTime">
                    <n-date-picker
                        class="timeslot-picker"
                        v-model:formatted-value="editingActivity.endTime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        type="datetime"
                        placeholder="选择结束时间"
                        :disabled="activityLoading"
                        input-readonly
                    />
                </n-form-item>

                <n-form-item label="时间段" path="timeSlots">
                    <div class="timeslot-container">
                        <div class="timeslot-btn">
                            <n-input-number
                                v-model:value="timeSlotInterval"
                                :min="15"
                                :max="360"
                                :step="15"
                                :disabled="activityLoading"
                                placeholder="时间间隔"
                                class="radius-r-none"
                            >
                                <template #suffix>分钟为单位</template>
                            </n-input-number>
                            <n-button
                                type="primary"
                                class="radius-l-none"
                                :disabled="activityLoading"
                                @click="doSplitTimeSlots"
                            >自动分割</n-button>
                        </div>
                        <!-- ITS A WONDER THIS EVEN WORKERS -->
                        <n-dynamic-input
                            v-model:value="editingActivity.timeSlots"
                            :on-create="generateNewTimeSlot"
                        >
                            <template #default="{ value }">
                                <div class="timeslot-picker">
                                    <n-date-picker
                                        type="datetimerange"
                                        placeholder="填写时间段"
                                        input-readonly
                                        :value="[parseDate(value.startTime), parseDate(value.endTime)]"
                                        :disabled="activityLoading"
                                        :on-update:value="(v) => {
                                            if (v == null) return;
                                            value.startTime = formatDate(v[0]);
                                            value.endTime = formatDate(v[1]);
                                        }"
                                    />
                                </div>
                            </template>
                        </n-dynamic-input>
                    </div>
                </n-form-item>
                <n-button
                    :disabled="!editingActivity.activityName || activityLoading"
                    @click="doSubmitActivity"
                    class="drawer-btn"
                    type="primary"
                >提交</n-button>
            </n-form>

            <n-popconfirm
                v-if="activityIdComputed"
                @positive-click="doDeleteActivity"
                positive-text="确定"
                negative-text="取消"
            >
                <template #trigger>
                    <n-button
                        :disabled="!editingActivity.activityName || activityLoading"
                        type="error"
                        class="drawer-btn"
                    >删除活动</n-button>
                </template>
                确定要删除活动 {{ editingActivity.activityName }} 吗？
            </n-popconfirm>

            <n-button
                v-if="activityIdComputed"
                :disabled="!editingActivity.activityName || activityLoading"
                type="default"
                class="drawer-btn"
                @click="goToActivity"
            >前往活动页</n-button>

            <n-button
                v-if="activityIdComputed"
                :disabled="!editingActivity.activityName || activityLoading"
                type="default"
                class="drawer-btn"
                @click="goToService"
            >查看维修单</n-button>

            <n-button
                v-if="activityIdComputed"
                :disabled="!editingActivity.activityName || activityLoading"
                type="default"
                class="drawer-btn"
                @click="goToStats"
            >统计活动数据</n-button>

        </n-drawer-content>
    </n-drawer>
</template>

<style scoped>
.drawer-btn {
    width: 100%;
    margin-top: 4px;
    margin-bottom: 24px;
}

.table-container {
    @apply flex justify-around;
}

.timeslot-picker {
    @apply flex justify-center items-center;
    width: 100%;
}

.timeslot-container {
    @apply flex flex-col justify-center items-center;
    width: 100%;
}

.timeslot-btn {
    @apply flex justify-between items-center;
    width: 100%;
    margin-bottom: 20px;
}

.timeslot-btn .n-button {
    @apply rounded-l-none;
    flex: 1;
}
</style>