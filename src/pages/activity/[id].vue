<script setup lang="ts">

import type { Activity, ActivityInfo } from '~/models/activity';
import type { Ref } from 'vue';
import type { CustomRequestOptions, FileInfo } from 'naive-ui/lib/upload/src/interface';

import { getActivityList, getActivityTimeSlots, getActivityQR } from '~/api/activity';
import { handleError } from '~/composables/error';

import { NImage, NDivider, NH1, NH2, NInput, NIcon, NUpload, NButton, NProgress, NCol, NRow } from 'naive-ui';

import { useMessage } from 'naive-ui';

import { ArrowUpOutline, CheckmarkOutline } from '@vicons/ionicons5';

import { Edit as EditIcon, ChevronLeft } from '@vicons/carbon';

import { parseDate, formatDate } from '~/composables/date';

import PollServicePanel from '~/components/PollServicePanel.vue';

useHead({
    title: '活动 | 修哇修哇'
})

const message = useMessage();
const router = useRouter();

const props = defineProps<{ id: string }>();
const idAsNumber = computed(() => Number(props.id));
const activityLoading = ref(false);

/* QR Image */
const activityQRBase64 = ref('');

const getActivityQRAsync = async () => {
    activityLoading.value = true;
    try {
        const res = await getActivityQR(idAsNumber.value);
        activityQRBase64.value = res;
    } catch (e: any) {
        handleError(e, message, router);
    } finally {
        activityLoading.value = false;
    }
};


/* Activity Info */
const incomingActivities: Ref<ActivityInfo[]> = ref([]);
const nowStr = formatDate(Date.now());
const activity: Ref<Activity> = ref({
    activityName: '',
    location: '',
    startTime: nowStr,
    endTime: nowStr,
    timeSlots: [],
});
const activityType = ref('success');
const activityTypeName = ref('进行中');

const getIncomingActivitiesAsync = async () => {
    activityLoading.value = true;
    try {
        const activities = await getActivityList({
            // endLower: formatDate(Date.now()),
        });
        incomingActivities.value = activities;
        console.log('incoming activities refreshed', activities);
    } catch (e: any) {
        handleError(e, message, router);
    } finally {
        activityLoading.value = false;
    }
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
        activity.value = act;
        console.log('activity refreshed', act);
    } catch (e: any) {
        handleError(e, message, router);
    } finally {
        activityLoading.value = false;
    }

    return act;
}

const activityPercentage = computed(() => {
    const act = activity.value;
    if (!act) return 0;
    const now = Date.now();
    const start = parseDate(act.startTime);
    const end = parseDate(act.endTime);
    if (now < start) return 5;
    if (now > end) return 100;
    const percentage = Math.round((now - start) * 100 / (end - start));
    return percentage;
});

/* back */
const goToPreviousPage = () => {
    router.back();
}

const headerText = ref('');
const editingHeader = ref(false);
const clearHeader = () => {
    headerText.value = '';
    editingHeader.value = false;
}

const setupTask = async () => {
    if (!idAsNumber.value) {
        return;
    }
    /* get QR */
    getActivityQRAsync();

    /* get Activity Info */
    await getIncomingActivitiesAsync();
    const actinfo = incomingActivities.value.find(act => act.id === idAsNumber.value);
    if (!actinfo) {
        return;
    }

    if (parseDate(actinfo.endTime) < Date.now()) {
        /* finished */
        activityType.value = 'error';
        activityTypeName.value = '已结束';
    } else if (parseDate(actinfo.startTime) < Date.now()) {
        /* in progress */
        activityType.value = 'success';
        activityTypeName.value = '进行中';
    } else {
        /* upcoming */
        activityType.value = 'info'
        activityTypeName.value = '即将开始';
    }

    const act = await getActivityAsync(actinfo);
    if (!act) {
        return;
    }
}

/* get activity info on setup */
setupTask();

/* stop ts complaits */
const imageProps = {
    class: "qr-image",
}

/* use n-upload as image */
const previewFileList = ref([
    {
        id: 'layout',
        name: '我是layout.png',
        status: 'finished',
        percentage: 100,
        url: '/activity-layout.png'
    }]) as Ref<FileInfo[]>;

const customRequest = ({ onFinish }: CustomRequestOptions) => { onFinish() }

</script>

<template>
    <div class="presentation-container">
        <div class="presentation-header">
            <n-progress
                type="line"
                :percentage="activityPercentage"
                :show-indicator="false"
                :status="activityType"
                :border-radius="0"
            />

            <div class="flex justify-between items-center mt-8 w-100vw">
                <n-button text @click="goToPreviousPage" size="large" class="mx-10">
                    <n-icon size="2vw">
                        <chevron-left />
                    </n-icon>
                </n-button>

                <n-input
                    v-if="editingHeader"
                    v-model:value="headerText"
                    :placeholder="activity.activityName"
                    size="large"
                    class="text-center"
                    clearable
                    @blur="editingHeader = false"
                    @keypress="(e: KeyboardEvent) => {
                        if (e.key === 'Enter') {
                            editingHeader = false;
                        }
                    }"
                />

                <n-h1 v-else class="logo-text">{{ headerText ? headerText : activity.activityName }}</n-h1>

                <n-button text @click="editingHeader = !editingHeader" class="mx-10">
                    <n-icon size="2vw">
                        <edit-icon v-if="!editingHeader" />
                        <checkmark-outline v-else />
                    </n-icon>
                </n-button>
            </div>
        </div>

        <div class="presentation-img">
            <div class="presentation-img-sub">
                <n-image
                    v-if="!activityQRBase64"
                    src="https://images.placeholders.dev/?width=282&height=321&text=加载中&bgColor=%23f7f6f6&textColor=%236d6e71"
                    :img-props="imageProps"
                    preview-disabled
                />
                <n-image
                    v-else
                    :src="'data:image/jpeg;base64, ' + activityQRBase64"
                    :img-props="imageProps"
                    show-toolbar-tooltip
                />
                <div class="mt-3">
                    <n-h1 class="flex items-center justify-center">
                        <n-icon size="35">
                            <arrow-up-outline />
                        </n-icon>&nbsp;
                        先扫描二维码签到
                    </n-h1>
                </div>
            </div>
            <n-divider vertical />
            <div class="presentation-img-sub">
                <n-upload
                    :max="1"
                    :custom-request="customRequest"
                    :default-file-list="previewFileList"
                    :show-preview-button="false"
                    list-type="image-card"
                />
                <div class="mt-3">
                    <n-h1 class="flex items-center justify-center">
                        <n-icon size="35">
                            <arrow-up-outline />
                        </n-icon>&nbsp;
                        再就座等待叫号
                    </n-h1>
                </div>
            </div>
        </div>

        <div>
            <div class="presentation-footer">
                <n-h2 prefix="bar" align-text type="warning">待接单</n-h2>
                <div />
                <n-h2 prefix="bar" align-text type="success">维修中</n-h2>
            </div>

            <div class="presentation-footer">
                <poll-service-panel :activity-id="idAsNumber" :status="3" text-color="warning" />
                <n-divider vertical />
                <poll-service-panel :activity-id="idAsNumber" :status="4" reversed />
            </div>
        </div>
    </div>
</template>

<style scoped>
.presentation-container {
    @apply flex flex-col justify-between;
    height: 100vh;
}

.presentation-header {
    @apply flex flex-col justify-center items-center mb-4;
}

.presentation-img {
    @apply flex justify-evenly items-center;
    overflow: hidden;
}

.presentation-img-sub {
    @apply flex flex-col text-center;
}

.presentation-footer {
    @apply flex justify-evenly items-center my-4;
}

.stats-item {
    @apply flex items-center justify-center;
}
</style>

<style>
/* overriding styles */
.presentation-container h1.n-h1 {
    font-size: 2.5vw;
    margin-bottom: 0px;
    margin-top: 0px;
}

.presentation-container h2.n-h2 {
    font-size: 1.8vw;
    margin-top: 0px;
    margin-bottom: 0px;
}

.presentation-img img.qr-image,
.presentation-img
    .n-upload-file-list
    .n-upload-file.n-upload-file--image-card-type
    img {
    width: 30vw;
    max-height: 50vh;
    height: auto;
    object-fit: contain !important;
}

.presentation-img .n-upload-file-list.n-upload-file-list--grid,
.presentation-img
    .n-upload-trigger.n-upload-trigger--image-card
    .n-upload-dragger,
.presentation-img
    .n-upload-file-list
    .n-upload-file.n-upload-file--image-card-type {
    border-width: 0;
    width: 30vw;
    height: min(34.15vw, 50vh); /* 282/321 */
    object-fit: contain !important;
}

.presentation-img .n-button.n-button--default-type.n-button--medium-type {
    --n-icon-size: 36px !important;
}

.presentation-footer .n-divider.n-divider--vertical,
.presentation-img .n-divider.n-divider--vertical {
    height: 100%;
    width: 1px;
}

.presentation-footer
    .n-statistic
    .n-statistic-value
    .n-statistic-value__content {
    font-size: 2.5vw;
}

.presentation-footer .n-statistic .n-statistic__label {
    font-size: 1.8vw;
}
</style>

<route lang=yaml>
meta: 
    layout: login
</route>