// use a global pagination property to be shared between all tables
export const tablePagination = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 40],
    onChange: (page: number) => {
        tablePagination.page = page
    },
    onUpdatePageSize: (pageSize: number) => {
        tablePagination.pageSize = pageSize
        tablePagination.page = 1
    }
})