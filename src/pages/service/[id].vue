<script setup lang="ts">
import type { ServiceEventDetail } from '~/models/service';
import type { User } from '~/models/user';
import type { Ref } from 'vue';
import type { TimelineItemProps } from 'naive-ui';

import { getServiceEventDetail } from '~/api/service';
import { getUserInfo } from '~/api/user';

import { useGlobalStore } from '~/stores/global';

import { handleError } from '~/composables/error'

import { NTimeline, NTimelineItem, NInput, NFormItem, NIcon, NH3, NSwitch, NImage, NImageGroup, NSpace } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { ToolKit } from '@vicons/carbon';

const message = useMessage();
const router = useRouter();
const globalStore = useGlobalStore();
const props = defineProps <{id: string}>();
const idAsNumber = computed((): number => Number(props.id));

const serviceDetail: Ref < ServiceEventDetail | null > = ref(null);
const serviceDetailLoading = ref(false);
const lastServiceForm = computed(() => {
    if (serviceDetail.value) {
        if (serviceDetail.value.serviceForms.length > 0) {
            return serviceDetail.value.serviceForms[serviceDetail.value.serviceForms.length - 1];
        }
        return null;
    }
    return null;
});

const getServiceDetailAsync = async (id: number) => {
    serviceDetailLoading.value = true;
    try {
        serviceDetail.value = await getServiceEventDetail(id);
        console.log('serviceDetail refreshed', serviceDetail.value);
    } catch (e: any){
        handleError(e, message, router);
    } finally {
        serviceDetailLoading.value = false;
    }
}

/* get service detail on setup */
if (idAsNumber.value && idAsNumber.value !== -1) {
    getServiceDetailAsync(idAsNumber.value);
}

const serviceType = computed(() => {
    switch (serviceDetail.value?.status) {
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
            console.log('undefined service status', serviceDetail.value?.status);
            return 'default';
    }
});

const imgUrl = (relative_url: string) => globalStore.backendUrl + '/img/' + relative_url
const thumbUrl = (relative_url: string) => globalStore.backendUrl + '/img/100_' + relative_url

/* timeline */
const timelineItems = computed(() => {
    const res: TimelineItemProps[] = []
    if (!serviceDetail.value) {
        return res;
    }

    res.push({
        title: '编辑维修单',
        content: serviceDetail.value.userName,
    });
    if (serviceDetail.value.draft) return res;

    for (let [index, form] of serviceDetail.value.serviceForms.entries()) {
        res.push({
            title: '提交维修单',
            content: form.computerModel,
            type: 'info'
        });
        if (form.descriptionAdvice){
            if (index === serviceDetail.value.serviceForms.length - 1) {
                // last form
                res.push({
                    title: '审核通过',
                    content: form.descriptionAdvice,
                    type: 'warning'
                })
            } else {
                res.push({
                    title: '审核不通过',
                    type: 'error'
                })
            }
        }
    }
    if (serviceDetail.value.volunteerName) {
        res.push({
            title: '接单',
            type: 'success',
            content: serviceDetail.value.volunteerName,
        })
    }
    if (serviceDetail.value.status === 5) {
        res.push({
            title: '维修完成',
            type: 'success',
            content: serviceDetail.value.repairingResult? serviceDetail.value.repairingResult : undefined,
        });
    }
    if (serviceDetail.value.feedback) {
        res.push({
            title: '反馈',
            content: serviceDetail.value.feedback
        })
    }
    return res;
});

/* userinfo */
const userInfo: Ref <User | null> = ref(null);
const userInfoLoading = ref(false);

const getUserInfoAsync = async (id: number) => {
    userInfoLoading.value = true;
    try {
        userInfo.value = await getUserInfo(id);
        console.log('userInfo refreshed', userInfo.value);
    } catch (e: any){
        handleError(e, message, router, '获取用户信息失败');
    } finally {
        userInfoLoading.value = false;
    }
}
</script>

<template>
<div class="page-container">
    <div class="service-logo flex items-center">
        <n-h3 prefix="bar" align-text class="logo-text flex items-center ml-2" :type="serviceType">
            <n-icon class="service-icon" size="20">
                <tool-kit />
            </n-icon> {{props.id}}
        </n-h3>
    </div>
    <section v-if="serviceDetail !== null" class="service-timeline">
        <n-timeline horizontal class="mx-2">
            <n-timeline-item
                v-for="(item, index) in timelineItems"
                :key="index"
                :title="item.title"
                :type="item.type"
                :content="item.content"
                :time="item.time"
            />
        </n-timeline>
    </section>
    <section v-if="serviceDetail !== null" class="service-form">
        <n-form-item label="活动">
            <n-input :value="serviceDetail.activityName" readonly/>
        </n-form-item>
        <n-form-item label="时间段">
            <n-input :value="serviceDetail.startTime + ' → ' + serviceDetail.endTime" readonly/>
        </n-form-item>

        <div v-if="lastServiceForm !== null">
            <n-form-item label="品牌">
                <n-input :value="lastServiceForm.brand" readonly/>
            </n-form-item>
            <n-form-item label="型号">
                <n-input :value="lastServiceForm.computerModel" readonly/>
            </n-form-item>
            <n-form-item label="电脑类型">
                <n-input :value="lastServiceForm.laptopType" readonly/>
            </n-form-item>
            <n-form-item label="CPU型号">
                <n-input :value="lastServiceForm.cpuModel" readonly/>
            </n-form-item>
            <n-form-item label="独立显卡型号" v-if="lastServiceForm.hasDiscreteGraphics">
                <n-input :value="lastServiceForm.graphicsModel" readonly/>
            </n-form-item>
            <n-form-item label="购买年月">
                <n-input :value="lastServiceForm.boughtTime" readonly/>
            </n-form-item>
            <n-form-item label="在保修期内">
                <n-switch :value="lastServiceForm.underWarranty" disabled />
            </n-form-item>
            <n-form-item label="故障类型">
                <n-input :value="lastServiceForm.problemType" readonly/>
            </n-form-item>
            <n-form-item label="故障描述">
                <n-input :value="lastServiceForm.problemDescription" readonly/>
            </n-form-item>
            <n-form-item label="故障图片">
                <n-image-group show-toolbar-tooltip>
                    <n-image
                        v-for="(item, index) in lastServiceForm.imageList"
                        :key="index"
                        width="100"
                        :src="thumbUrl(item)"
                        :preview-src="imgUrl(item)"
                    />
                </n-image-group>
            </n-form-item>
        </div>

        <n-form-item label="故障概述" v-if="serviceDetail.problemSummary">
            <n-input :value="serviceDetail.problemSummary" readonly/>
        </n-form-item>
        <n-form-item label="审核消息" v-if="lastServiceForm?.descriptionAdvice">
            <n-input :value="lastServiceForm.descriptionAdvice" readonly/>
        </n-form-item>
        
    </section>
</div>
</template>

<style scoped>
.service-timeline {
    margin-top: 20px;
    overflow: scroll;
}

.service-logo {
    margin: 15px;
    flex: none;
}

.service-icon {
    @apply mx-2;
}
</style>