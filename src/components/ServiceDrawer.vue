<script setup lang="ts">
import type { ServiceAudit, ServiceEventDetail } from '~/models/service';
import type { User } from '~/models/user';
import type { Ref } from 'vue';
import type { TimelineItemProps } from 'naive-ui';

import { auditServiceEvent, getServiceEventDetail } from '~/api/service';
import { getUserInfo } from '~/api/user';

import { useGlobalStore } from '~/stores/global';

import { handleError } from '~/composables/error'

import { NTimeline, NTimelineItem, NInput, NFormItem, NIcon, NH3, NSwitch, NImage, NImageGroup, NCard, NButton, NDrawer, NPopover } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { ToolKit, PhoneFilled, Email, ArrowRight } from '@vicons/carbon';

import { useWindowSize } from '@vueuse/core';

/* make it responsive */
const windowSize = useWindowSize();

const useMobileLayout = computed(() => {
    return windowSize.width.value <= 705;
})

const drawerWidth = computed(() => {
    // make it possible to close
    return useMobileLayout.value ? windowSize.width.value * 0.85 : 600;
})

const message = useMessage();
const router = useRouter();
const globalStore = useGlobalStore();

const props = defineProps({
    service: {
        type: Object as () => ServiceEventDetail,
        required: true,
    },
    show: {
        type: Boolean as () => boolean,
        required: true,
    },
});

const emit = defineEmits(['update:show']);
const showVal = ref(props.show);
const handleUpdate = () => emit('update:show', showVal.value);

const lastServiceForm = computed(() => {
    if (props.service) {
        if (props.service.serviceForms.length > 0) {
            return props.service.serviceForms[props.service.serviceForms.length - 1];
        }
        return null;
    }
    return null;
});

const serviceType = computed(() => {
    switch (props.service?.status) {
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
            console.log('undefined service status', props.service?.status);
            return 'default';
    }
});

const imgUrl = (relative_url: string) => globalStore.backendUrl + '/img/' + relative_url
const thumbUrl = (relative_url: string) => globalStore.backendUrl + '/img/100_' + relative_url

/* timeline */
const timelineItems = computed(() => {
    const res: TimelineItemProps[] = []
    if (!props.service) {
        return res;
    }

    res.push({
        title: '编辑维修单',
        content: props.service.userName,
    });
    if (props.service.draft) return res;

    for (let [index, form] of props.service.serviceForms.entries()) {
        res.push({
            title: '提交维修单',
            content: form.computerModel,
            type: 'info'
        });
        if (form.descriptionAdvice){
            if (props.service.status !== 0 && index === props.service.serviceForms.length - 1) {
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
    if (props.service.volunteerName) {
        res.push({
            title: '接单',
            type: 'success',
            content: props.service.volunteerName,
        })
    }
    if (props.service.status === 5) {
        res.push({
            title: '维修完成',
            type: 'success',
            content: props.service.repairingResult? props.service.repairingResult : undefined,
        });
    }
    if (props.service.feedback) {
        res.push({
            title: '反馈',
            content: props.service.feedback
        })
    }
    return res;
});

/* userinfo */
const userInfo: Ref <User|null> = ref(null);
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

/* get client info */

watch(props, (newVal, oldVal) => {
    if (newVal.show === true) {
        getUserInfoAsync(newVal.service.userId);
    }
})

/* audit */
const auditLoading = ref(false);
const auditResult: Ref <ServiceAudit> = ref ({
    message: '',
    problemSummary: '',
    result: false,
    serviceEventId: 0,
    serviceFormId: 0,
})

const auditServiceAsync = async (passed: boolean) => {
    if (lastServiceForm.value === null) return;
    auditLoading.value = true;
    try {
        auditResult.value.result = passed;
        auditResult.value.serviceEventId = props.service.id;
        auditResult.value.serviceFormId = lastServiceForm.value.formID;
        console.log('auditResult', auditResult.value);
        await auditServiceEvent(auditResult.value);
        message.success('审核成功');
    } catch (e: any){
        handleError(e, message, router, '审核失败');
    } finally {
        auditLoading.value = false;
    }
}

const summaryRules = {
    trigger: ['input', 'blur'],
    validator: () => {
        if (!auditResult.value.problemSummary) {
            return new Error('请填写问题概述');
        }
        if (auditResult.value.problemSummary.length > 20) {
            return new Error('问题概述不能超过20字');
        }
        return true;
    }
}

const messageRules = {
    trigger: ['input', 'blur'],
    validator: () => {
        if (!auditResult.value.message) {
            return new Error('请填写审核意见');
        }
        if (auditResult.value.message.length > 20) {
            return new Error('审核意见不能超过20字');
        }
        return true;
    }
}


</script>

<template>
<n-drawer
    :show="props.show"
    :width="drawerWidth"
    :auto-focus="false"
    @update:show="handleUpdate"
>
    <div class="page-container">
        <div class="service-logo flex items-center justify-between mx-2">
            <n-h3 prefix="bar" align-text class="logo-text flex items-center" :type="serviceType">
                <n-icon class="service-icon" size="20">
                    <tool-kit />
                </n-icon> {{props.service.id}}
            </n-h3>
            
            <div class="flex">
                <n-popover trigger="hover">
                    <template #trigger>
                    <n-button text> 
                        <n-h3 style="color: inherit;"> {{ props.service.userName }} </n-h3>
                    </n-button>
                    </template>
                    <span v-if="userInfo" class="flex items-center"> 
                        <n-icon class="mr-2">
                            <phone-filled />
                        </n-icon>
                            {{ userInfo.phoneNumber }}
                    </span>
                    <span v-if="userInfo" class="flex items-center"> 
                        <n-icon class="mr-2">
                            <email />
                        </n-icon>
                            {{ userInfo.email ? userInfo.email : '未填写' }}
                    </span>
                </n-popover>

                <n-icon v-if="props.service.volunteerName" class="mx-2" size="18">
                    <arrow-right />
                </n-icon>

                <n-popover v-if="props.service.volunteerName" trigger="hover">
                    <template #trigger>
                    <n-button text> 
                        <n-h3 style="color: inherit;"> {{ props.service.volunteerName }} </n-h3>
                    </n-button>
                    </template>
                    <span class="flex items-center"> 
                        <n-icon class="mr-2">
                            <phone-filled />
                        </n-icon>
                        {{ props.service.volunteerPhoneNumber }} 
                    </span>
                    <span class="flex items-center"> 
                        <n-icon class="mr-2">
                            <email />
                        </n-icon>
                            {{ props.service.volunteerEmail ? props.service.volunteerEmail : '未填写' }}
                    </span>
                </n-popover>

            </div>
        </div>
        
        <section v-if="props.service !== null" class="service-form-content">
            <n-timeline horizontal class="pl-8 justify-start overflow-auto">
                <n-timeline-item
                    v-for="(item, index) in timelineItems"
                    :key="index"
                    :title="item.title"
                    :type="item.type"
                    :time="item.time"
                    :content="item.content"
                />
            </n-timeline>

            <n-card class="card-content-no-pb">
                <template #header>
                    活动信息
                </template>
                <n-form-item label="活动">
                    <n-input :value="props.service.activityName" readonly/>
                </n-form-item>
                <n-form-item label="时间段">
                    <n-input :value="props.service.startTime + ' → ' + props.service.endTime" readonly/>
                </n-form-item>
            </n-card>

            <n-card v-if="lastServiceForm !== null" class="card-content-no-pb">
                <template #header>
                    电脑信息
                </template> 
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
                    <n-input :value="lastServiceForm.boughtTime.substring(0, lastServiceForm.boughtTime.lastIndexOf('-'))" readonly/>
                </n-form-item>
                <n-form-item label="在保修期内">
                    <n-switch :value="lastServiceForm.underWarranty" disabled />
                </n-form-item>
            </n-card>

            <n-card v-if="lastServiceForm !== null" class="card-content-no-pb">
                <template #header>
                    故障信息
                </template> 
                <n-form-item label="故障类型">
                    <n-input :value="lastServiceForm.problemType" readonly/>
                </n-form-item>
                <n-form-item label="故障描述">
                    <n-input :value="lastServiceForm.problemDescription" readonly/>
                </n-form-item>
                <n-form-item v-if="lastServiceForm.imageList.length > 0" label="故障图片">
                    <n-image-group show-toolbar-tooltip>
                        <n-image
                            v-for="(item, index) in lastServiceForm.imageList"
                            class="service-form-image"
                            :key="index"
                            :src="thumbUrl(item)"
                            :preview-src="imgUrl(item)"
                        />
                    </n-image-group>
                </n-form-item>
            </n-card>

            <n-card v-if="props.service.problemSummary && lastServiceForm?.descriptionAdvice" class="card-content-no-pb">
                <template #header>
                    审核结果
                </template> 
                <n-form-item label="故障概述" >
                    <n-input :value="props.service.problemSummary" readonly/>
                </n-form-item>
                <n-form-item label="审核消息">
                    <n-input :value="lastServiceForm.descriptionAdvice" readonly/>
                </n-form-item>
            </n-card>

            <n-card v-if="props.service.status === 1" class="card-content-no-pb">
                <template #header>
                    审核维修单
                </template> 
                <template #action>
                    <n-form-item label="故障概述" :rule="summaryRules">
                        <n-input v-model:value="auditResult.problemSummary" :rule="summaryRules"/>
                    </n-form-item>
                    <n-form-item label="审核消息" :rule="messageRules">
                        <n-input v-model:value="auditResult.message" />
                    </n-form-item>
                    <div class="flex justify-between gap-5">
                        <n-button
                            type="error"
                            class="text-center flex-1"
                            @click="auditServiceAsync(false)"
                        >不通过</n-button>
                        <n-button
                            type="success"
                            class="text-center flex-1"
                            @click="auditServiceAsync(true)"
                        >通过</n-button>
                    </div>

                </template>
            </n-card>

            <n-card v-if="props.service.feedback || props.service.repairingResult " class="card-content-no-pb">
                <template #header>
                    反馈
                </template> 
                <n-form-item v-if="props.service.repairingResult" label="志愿者反馈" >
                    <n-input :value="props.service.repairingResult" readonly/>
                </n-form-item>
                <n-form-item v-if="props.service.feedback" label="用户反馈">
                    <n-input :value="props.service.feedback" readonly/>
                </n-form-item>
            </n-card>
            
        </section>
    </div>
</n-drawer>
</template>

<style scoped>
.service-timeline {
    @apply m-auto;
}

.service-logo {
    margin: 15px;
    flex: none;
}

.service-icon {
    @apply mx-2;
}

.page-container {
    @apply m-auto;
    @apply p-4;
}

.service-form-content {
    @apply flex flex-col items-center;
    gap: 20px;
}


</style>

<style>
.card-content-no-pb .n-card__content{
    padding-bottom: 0;
}

.card-action-no-pb .n-card__action {
    padding-top: 0;
}

.service-form-image > img {
    object-fit: contain !important;
    width: 100px;
    max-height: 100px;
    margin: auto;
}
</style>