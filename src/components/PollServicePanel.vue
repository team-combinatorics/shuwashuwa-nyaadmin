<script setup lang="ts">
import { NRow, NCol, NText, NStatistic, NIcon } from 'naive-ui';

import { timeAgo } from '~/composables/date';
import { handleError } from '~/composables/error';
import { formatDate } from '~/composables/date';
import { useMessage } from 'naive-ui';

import { getServiceEventList } from '~/api/service';

import { Time as TimeIcon } from '@vicons/carbon';

const message = useMessage();
const router = useRouter();

const props = defineProps({
    activityId: {
        type: Number,
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
    pollInterval: {
        type: Number,
        default: 10,
    },
    reversed: {
        type: Boolean,
        default: false,
    },
    numServices: {
        type: Number,
        default: 4,
    },
    textColor: {
        type: String,
        default: 'primary',
    },
    rolling: {
        type: Boolean,
        default: true,
    }
});

/* timeago */
const pollIndicator = ref(0);

const pollTimeAgo = (timestamp: Date | number) =>{
    if (pollIndicator.value >= 0) {
        return timeAgo(timestamp);
    }
};

/* orders */
interface ServiceProps {
    serviceId: number;
    takeTimestamp: number;
}

const currentServiceIds = ref<number[]>([]);
const prevServiceIds = ref<number[]>([]);

const servicePropsList = ref<ServiceProps[]>([
]);

const filteredPropsList = computed(() => {
    if (props.numServices <= 0) {
        throw new Error('numServices must be greater than 0');
    }
    if (!props.reversed) {
        return servicePropsList.value.slice(0, props.numServices);
    } else {
        return servicePropsList.value.slice(-props.numServices);
    }
});

const span = computed(() => {
    if (props.numServices <= 0) {
        throw new Error('numServices must be greater than 0');
    }
    return Math.round(24 / props.numServices);
});

const getWorkingServicesAsync = async () => {
    try {
        const res = await getServiceEventList({
            activity: props.activityId,
            status: props.status,
        });
        console.log(props.activityId, props.status, res);
        currentServiceIds.value = res.map(e => e.serviceEventId);
        console.log('services list refreshed', formatDate(Date.now()), currentServiceIds.value);
    } catch (e: any) {
        handleError(e, message, router);
    }
}

const updateWorkingServices = async () => {
    await getWorkingServicesAsync();
    const diff = currentServiceIds.value.filter(id => !prevServiceIds.value.includes(id));
    prevServiceIds.value = currentServiceIds.value;

    diff.forEach(id => {
        const serviceProps: ServiceProps = {
            serviceId: id,
            takeTimestamp: Date.now(),
        };
        servicePropsList.value.push(serviceProps);
    });

    servicePropsList.value = servicePropsList.value.filter(
        e => currentServiceIds.value.includes(e.serviceId)
    );

    pollIndicator.value = (pollIndicator.value + 1) % 60;
}

/* update on setup */
updateWorkingServices();
/* run updateWorkingServices() every N seconds */
const timerId = setInterval(updateWorkingServices, props.pollInterval * 1000);
/* cancel timer when component unmounts */
onBeforeUnmount(() => clearInterval(timerId));

</script>

<template>
    <n-row>
        <n-col v-if="filteredPropsList.length === 0" :span="(span as any)" class="stats-item">
            <n-statistic label="无维修单">
                <n-icon>
                    <time-icon />
                </n-icon>
            </n-statistic>
        </n-col>
        <n-col v-for="(item ,index) in filteredPropsList" :key="index" :span="(span as any)" class="stats-item">
            <n-statistic>
            <template #label>
                <time class="timeago" :datetime="new Date(item.takeTimestamp as number).toISOString()"> 
                    {{pollTimeAgo(item.takeTimestamp as number)}} 
                </time>
            </template>
                <n-text :type="props.textColor"> {{item.serviceId}} </n-text>
                </n-statistic>
        </n-col>
    </n-row>
</template>

<style scoped>
.stats-item {
    @apply flex items-center justify-center;
}

</style>