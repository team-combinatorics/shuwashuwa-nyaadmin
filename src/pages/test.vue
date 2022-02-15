<template>
  <n-upload
    :max="1"
    :custom-request="customRequest"
    :default-file-list="previewFileList"
    :show-preview-button="false"
    style="width: 500px; height: 500px;"
    list-type="image-card"
  />

  <DoughnutChart :chartData="testData" />
</template>

<script setup lang="ts">
import { NUpload } from 'naive-ui';

import type { Ref } from 'vue';

import type { CustomRequestOptions, FileInfo } from 'naive-ui/lib/upload/src/interface';

import { DoughnutChart } from 'vue-chart-3';

const previewFileList = ref([
    {
        id: 'react',
        name: '我是react.png',
        status: 'finished',
        percentage: 100,
        url: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
    }]) as Ref<FileInfo[]>;

const customRequest = ({onFinish}: CustomRequestOptions) => { onFinish() }

/* service event count */

const passedServiceCount = ref(-1);
const toWorkServiceCount = ref(-1);
const workingServiceCount = ref(-1);
const finishedServiceCount = ref(-1);

// const getServiceCountAsync = async (activityId: number) => {
//     for (let serviceType of [2,3,4,5]) {
//         try {
//             const count = await getServiceEventCount({
//                 activity: activityId,
//                 status: serviceType,
//             })
//             if (serviceType === 2) {
//                 passedServiceCount.value = count;
//             } else if (serviceType === 3) {
//                 toWorkServiceCount.value = count;
//             } else if (serviceType === 4) {
//                 workingServiceCount.value = count;
//             } else if (serviceType === 5) {
//                 finishedServiceCount.value = count;
//             }
//         } catch (e: any) {
//             handleError(e, message, router);
//         }
//     }
// } 

const testData = {
      labels: ['Paris', 'Nîmes', 'Toulon', 'Perpignan', 'Autre'],
      datasets: [
        {
          data: [30, 40, 60, 70, 5],
          backgroundColor: ['#77CEFF', '#0079AF', '#123E6B', '#97B0C4', '#A5C8ED'],
        },
      ],
    };

</script>