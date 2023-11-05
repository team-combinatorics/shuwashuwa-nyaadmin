// use a global pagination property to be shared between all tables

import { useWindowSize } from '@vueuse/core';

const windowSize = useWindowSize()
const useMobileLayout = computed(() => {
    return windowSize.width.value <= 480;
})

const useMobilePagination = () => {
    const _r = reactive({
        page: 1,
        pageSize: 40,
        showSizePicker: false,
        onChange: (page: number) => {
            _r.page = page
        },
        onUpdatePageSize: (pageSize: number) => {
            _r.pageSize = pageSize
            _r.page = 1
        }
    })
    return _r
}

const useDesktopPagination = () => {
    const _r = reactive({
        page: 1,
        pageSize: 10,
        showSizePicker: true,
        pageSizes: [10, 20, 40],
        onChange: (page: number) => {
            _r.page = page
        },
        onUpdatePageSize: (pageSize: number) => {
            _r.pageSize = pageSize
            _r.page = 1
        }
    })
    return _r
}

export const useTablePagination = useMobileLayout.value ? useMobilePagination : useDesktopPagination
