<script setup lang="ts">
import { useHead } from '@vueuse/head';
import type { Ref } from 'vue';

import type { User } from '~/models/user';
import { deleteAdmin, getAdminList, updateAdmin, addAdmin, getVolunteerList } from '~/api/user';
import { handleError } from '~/composables/error';

import { NDataTable, NButton, NIcon, NDrawer, NDrawerContent, NForm, NFormItem, NInput, NPopconfirm, c } from 'naive-ui';
import { useMessage } from 'naive-ui';

import { Edit } from '@vicons/carbon';

import { Index, Document } from 'flexsearch';

useHead({
    title: '管理员 | 修哇修哇'
})

const messge = useMessage();
const router = useRouter();

const adminList: Ref<User[]> = ref([]);
const adminLoading = ref(false);

const getAdminListAsync = async () => {
    if (adminLoading.value) return;  /* skip repeated requests */
    adminLoading.value = true;
    try {
        const list = await getAdminList();
        adminList.value = list;
        console.log(list);
    } catch (e: any) {
        handleError(e, messge, router);
    } finally {
        adminLoading.value = false;
    }
}

/* get admin list on setup */
getAdminListAsync();

const defaultEditingAdmin: User = {
    userid: -1,
    userName: '',
    studentId: '',
    phoneNumber: '',
    department: '',
    email: '',
    identity: ''
}

/* editDrawer */
const isEditing = ref(false);
const editingAdmin = ref<User>(defaultEditingAdmin);

const userIdComputed = computed(() => {
    return editingAdmin.value.userid.toString();
})

const doEditAdmin = (user: User) => {
    console.log(user, user.userid);
    editingAdmin.value = user;
    isEditing.value = true;
}

const submitAdminInfoAsync = async (user: User) => {
    try {
        await updateAdmin(user);
        messge.success('修改成功');
    } catch (e: any) {
        handleError(e, messge, router);
    }
}

const doSubmitAdmin = () => {
    if (editingAdmin.value.userid === defaultEditingAdmin.userid) return;

    submitAdminInfoAsync(editingAdmin.value);
    isEditing.value = false;
    editingAdmin.value = defaultEditingAdmin;
}

const deleteAdminAsync = async (user: User) => {
    try {
        await deleteAdmin(user.userid);
        messge.success('删除成功');
    } catch (e: any) {
        handleError(e, messge, router);
    }
}

const doDeleteAdmin = () => {
    if (editingAdmin.value.userid === defaultEditingAdmin.userid) return;
    /* deleting superAdmin */
    if (editingAdmin.value.userid === 1) {
        messge.error('不能删除超级管理员');
        return;
    }
    deleteAdminAsync(editingAdmin.value);
    isEditing.value = false;
    editingAdmin.value = defaultEditingAdmin;
}

/* addDrawer */
const isAdding = ref(false);
const addingAdmin = ref<User>(defaultEditingAdmin);

const addAdminAsync = async (user: User) => {
    try {
        await addAdmin(user);
        messge.success('添加成功');
    } catch (e: any) {
        handleError(e, messge, router);
    }
}

const doAddAdmin = () => {
    if (addingAdmin.value.userid === defaultEditingAdmin.userid) return;
    addAdminAsync(addingAdmin.value);
    isAdding.value = false;
    addingAdmin.value = defaultEditingAdmin;
}

/* search */
const volunteerIDs: Ref<Number[]> = ref([]);
const volunteerList: Ref<User[]> = ref([]);

const getVolunteerListAsync = async () => {
    try {
        const list = await getVolunteerList();
        console.log(list);
        volunteerList.value = list;
    } catch (e: any) {
        handleError(e, messge, router);
    }
}

const index = new Document({
    document: {
        id: 'userid',
        index: ['userName', 'studentId', 'phoneNumber', 'department', 'email', 'identity']
    }
})

const buildVolunteerIndex = async () => {
    await getVolunteerListAsync();
    volunteerList.value.forEach(user => {
        index.add(user);
    })
}

/* get volunteer list on setup */
buildVolunteerIndex();

const doSearchVolunteer = async (keyword: string) => {
    const result = await index.searchAsync(keyword, 5);
    volunteerIDs.value = result as unknown as Number[];
}


/* table */
const columns = [
    {
        title: 'ID',
        key: 'userid',
        fixed: 'left',
        width: '60px',
    },
    {
        title: '姓名',
        key: 'userName',
        fixed: 'left',
        width: '120px',
        ellipsis: {
            tooltip: true
        },
    },
    {
        title: '学号',
        key: 'studentId',
        ellipsis: {
            tooltip: true
        },
    },
    {
        title: '手机',
        key: 'phoneNumber',
        ellipsis: {
            tooltip: true
        }
    },
    {
        title: '身份',
        key: 'identity',
        ellipsis: {
            tooltip: true
        }
    },
    {
        title: '邮箱',
        key: 'email',
        ellipsis: {
            tooltip: true
        }
    },
    {
        title: '部门',
        key: 'department',
        ellipsis: {
            tooltip: true
        }
    },
    {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: '60px',
        render: (row: User) => h(
            NButton,
            {
                strong: true,
                tertiary: true,
                size: 'small',
                onClick: () => doEditAdmin(row)
            },
            { default: () => h(NIcon,
                {},
                { default: () => h(Edit) }
            ) }
        )
    }
]

const columnsRef = ref(columns)
const handleSorterChange = (sorter: any) => {
    columnsRef.value.forEach((column) => {
        /** column.sortOrder !== undefined means it is uncontrolled */
        console.log(sorter)
        if (column.sortOrder === undefined) return
            if (!sorter) {
            column.sortOrder = false
            return
        }
        if (column.key === sorter.columnKey) column.sortOrder = sorter.order
        else column.sortOrder = false
    })
}

</script>

<template>
    <!-- table -->
    <n-data-table 
        ref="table"
        :columns="columns" 
        :data="adminList" 
        :loading="adminLoading"
        :scroll-x="1000"
        @update:sorter="handleSorterChange"
        striped
    />

    <!-- editDrawer -->
    <n-drawer
        placement="right"
        :auto-focus="false"
        v-model:show="isEditing"
        close-on-esc
    >
        <n-drawer-content title="编辑管理员">
            <n-form ref="formRef" :model="editingAdmin">
                <n-form-item label="ID" path="userid">
                    <n-input
                        :disabled="true"
                        :value="userIdComputed"
                    />
                </n-form-item>
                <n-form-item label="姓名" path="userName">
                    <n-input
                        v-model:value="editingAdmin.userName"
                    />
                </n-form-item>
                <n-form-item label="学号" path="confirmPassword">
                    <n-input
                        v-model:value="editingAdmin.studentId"
                    />
                </n-form-item>
                <n-form-item label="手机" path="phoneNumber">
                    <n-input
                        v-model:value="editingAdmin.phoneNumber"
                    />
                </n-form-item>
                <n-form-item label="邮箱" path="email">
                    <n-input
                        v-model:value="editingAdmin.email"
                    />
                </n-form-item>
                <n-form-item label="身份" path="identity">
                    <n-input
                        v-model:value="editingAdmin.identity"
                    />
                </n-form-item>
                <n-form-item label="部门" path="department">
                    <n-input
                        v-model:value="editingAdmin.department"
                    />
                </n-form-item>
                <n-button
                    @click="doSubmitAdmin"
                    class="drawer-btn"
                    type="success"
                >提交</n-button>
            </n-form>

            <n-popconfirm @positive-click="doDeleteAdmin" positive-text="确定" negative-text="取消">
                    <template #trigger>
                        <n-button type="error" class="drawer-btn">
                            删除管理员
                        </n-button>
                    </template>
                    确定要删除管理员 {{ editingAdmin.userName }} 吗？
                </n-popconfirm>
        </n-drawer-content>
    </n-drawer>
</template>

<style scoped>
.drawer-btn{
    width: 100%;
    margin-top: 4px;
    margin-bottom: 24px;
}
</style>