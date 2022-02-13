<script setup lang="ts">

import type { Activity, ActivityInfo } from '~/models/activity';
import type { Ref } from 'vue';

import { getActivityList, getActivityTimeSlots, getActivityQR } from '~/api/activity';
import { handleError } from '~/composables/error';

import { NImage, NDivider, NH1, NIcon } from 'naive-ui';

import { useMessage } from 'naive-ui';
import { formatDate } from '~/composables/date';

import { ArrowUpOutline } from '@vicons/ionicons5';
import { parseDate } from '~/composables/date';

const message = useMessage();
const router = useRouter();


const props = defineProps <{id: string}>();
const idAsNumber = computed(() => Number(props.id));
const activityLoading = ref(false);
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
const activityQRBase64 = ref('');

const qrHeight = ref(282);
const qrWidth = ref(321);


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


const getIncomingActivitiesAsync = async () => {
    activityLoading.value = true;
    try {
        const activities = await getActivityList({
            endLower: formatDate(Date.now()),
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

const setupTask = async () => {
    if (!idAsNumber.value) {
        return;
    }
    /* get QR */
    getActivityQRAsync();

    /* get Activity Info */
    await getIncomingActivitiesAsync();
    const actinfo = incomingActivities.value.find(act => act.id === idAsNumber.value);
    if (!actinfo){
        return;
    }

    if (parseDate(actinfo.endTime) < Date.now()) {
        /* finished */
        activityType.value = 'warning';
    } else if (parseDate(actinfo.startTime) < Date.now()) {
        /* in progress */
        activityType.value = 'success';
    } else {
        /* upcoming */
        activityType.value = 'info'
    }


    const act = await getActivityAsync(actinfo);
    if (!act) {
        return;
    }
}

/* stop ts complaits */
const imageProps = {
    class: "qr-image",
}

/* get activity info on setup */
setupTask();

</script>

<template>
<div class="page-container">
    <div class="presentation-header">
        <n-h1 prefix="bar" class="logo-text" type="success"> {{ activity.activityName }} </n-h1>
    </div>
    <div class="presentation-img">
        <div class="flex flex-col text-center">
            <n-image
                :src="'data:image/jpeg;base64, ' + activityQRBase64"
                :img-props="imageProps"
            />
            <n-h1 class="flex items-center justify-center">
                <n-icon size="35">
                    <arrow-up-outline />
                </n-icon>
                &nbsp;
                先扫描二维码签到
            </n-h1>
        </div>
        <n-divider vertical />
        <div class="flex flex-col text-center">
            <n-image
                src="/activity-layout.webp"
                :img-props="imageProps"
            />
            <n-h1 class="flex items-center justify-center">
                <n-icon size="35">
                    <arrow-up-outline />
                </n-icon>
                &nbsp;
                再就座等待叫号
            </n-h1>
        </div>

    </div>    
</div>
</template>

<style scoped>
.presentation-header {
    @apply flex justify-center items-center;
    margin-top: 20px;
}
.presentation-img {
    @apply flex justify-evenly items-center;
}
</style>

<style>

.qr-image {
    width: 30vw;
    height: auto;
    object-fit: cover;
}

.page-container {
    @apply flex flex-col;
    height: 100%;
}
</style>

<style>
.presentation-img .n-divider.n-divider--vertical {
    height: 100%;
    width: 0.3vw;
}
</style>