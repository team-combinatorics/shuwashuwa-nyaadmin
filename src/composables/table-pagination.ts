// use a global pagination property to be shared between all tables

import { useWindowSize } from '@vueuse/core';

const windowSize = useWindowSize()
const useMobileLayout = computed(() => {
    return windowSize.width.value <= 480;
})

const mobilePagination = reactive({
    page: 1,
    pageSize: 40,
    showSizePicker: false,
    onChange: (page: number) => {
        mobilePagination.page = page
    },
    onUpdatePageSize: (pageSize: number) => {
        mobilePagination.pageSize = pageSize
        mobilePagination.page = 1
    }
})

const desktopPagination = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 40],
    onChange: (page: number) => {
        desktopPagination.page = page
    },
    onUpdatePageSize: (pageSize: number) => {
        desktopPagination.pageSize = pageSize
        desktopPagination.page = 1
    }
})

export const tablePagination = computed(() => 
    useMobileLayout.value ? mobilePagination : desktopPagination
)