<script setup lang="ts">
import { useHead } from '@vueuse/head';
import type { Ref, VNodeChild } from 'vue';

import type { User } from '~/models/user';
import { deleteAdmin, getAdminList, updateAdmin, addAdmin, getVolunteerList, getUserInfo } from '~/api/user';

import { handleError } from '~/composables/error';

import { NDataTable, NButton, NIcon, NDrawer, NDrawerContent, NForm, NFormItem, NInput, NPopconfirm, NAutoComplete, NColl } from 'naive-ui';
import type { SelectOption } from 'naive-ui';
import { useMessage } from 'naive-ui';

import { Edit } from '@vicons/carbon';
import { AddOutline, CheckmarkOutline, CloseOutline } from '@vicons/ionicons5';

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
        console.log('admin list refreshed', list);
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

    deleteAdminAsync(editingAdmin.value)
    .then(()=>{   
        /* refresh admin list */
        getAdminListAsync()
    })

    isEditing.value = false;
    editingAdmin.value = defaultEditingAdmin;
}

/* addDrawer */
const isAdding = ref(false);
const addingAdmin = ref(defaultEditingAdmin);
const addAdminInput = ref('');
const addAdminInputLoading = ref(false);

const addAdminAsync = async (user: User) => {
    try {
        /* fill null fields with empty string */
        Object.keys(defaultEditingAdmin).forEach(key => {
            if (user[key] === null) user[key] = '';
        })
        await addAdmin(user);
        messge.success('添加管理员 ' + user.userName + ' 成功');
    } catch (e: any) {
        handleError(e, messge, router, '添加管理员失败（用户不存在或已经是管理员）');
    }
}

const doAddAdmin = async () => {
    addAdminInputLoading.value = true;

    /* not selected, try to get user info by id */
    if (addingAdmin.value.userid === defaultEditingAdmin.userid) {
        /* if addAdminInput can be parsed as number */
        if (Number.isInteger(Number(addAdminInput.value))) {
            try {
                const user = await getUserInfo(Number(addAdminInput.value));
                addingAdmin.value = user;
                console.log(user);
            } catch (e: any) {
                handleError(e, messge, router, '获取用户信息失败');
            }
        } else {
            /* reset state and return */
            messge.error('请输入正确的ID');
            isAdding.value = false;
            addingAdmin.value = defaultEditingAdmin;
            return;
        }
    }

    /* add admin */
    await addAdminAsync(addingAdmin.value);

    /* reset state */
    isAdding.value = false;
    addingAdmin.value = defaultEditingAdmin;

    /* trigger update */
    getAdminListAsync();
}

/* search */
const _temp: User[] = [{
    userid: 1,
    userName: '超级管理员',
    studentId: '2000011100',
    phoneNumber: '13000000000',
    department: '超级管理员',
    email: '12f23eddde@no-reply.github.com',
    identity: '超级管理员'
},
{
    userid: 2,
    userName: '蛤蛤',
    studentId: '11221',
    phoneNumber: '103301',
    department: '2022100',
    email: '1700029@1.com',
    identity: '哈哈'
},
{
    userid: 4,
    userName: '草草',
    studentId: '1800012020',
    phoneNumber: '1771771771',
    department: '200002000',
    email: '1700001799@1.com',
    identity: '草草'
}]

const volunteerIDs: Ref<Number[]> = ref([1, 2]);
const volunteerList: Ref<User[]> = ref(_temp);

const getVolunteerListAsync = async () => {
    try {
        const list = await getVolunteerList();
        console.log('volunteer list refreshed', list);
        volunteerList.value = list;
    } catch (e: any) {
        handleError(e, messge, router);
    }
}

const index = new Document({
    charset: 'utf-8',
    document: {
        id: 'userid',
        index: ['userName', 'studentId'],
    },
    tokenize: 'forward'
})

const buildVolunteerIndex = async () => {
    await getVolunteerListAsync();
    volunteerList.value.forEach(user => {
        index.add(user);
    })
}

/* get volunteer list on setup */
buildVolunteerIndex();

/* might be slow */
const searchOptions = computed(() => {
    if (addAdminInput.value === '') return [];

    const result = index.search(addAdminInput.value, 5);

    /* concat result arrays */
    const filteredVolunteerIDs: Set<Number> = new Set();
    result.forEach(item => {
        item.result.forEach(i => {
            filteredVolunteerIDs.add(i as Number);
        })
    })

    /* filter volunteer list */
    return volunteerList.value
        .filter(user => filteredVolunteerIDs.has(user.userid))
        .map(user => {
            return {
                value: user.userid,
                label: user.userName + '(' + user.studentId + ')'
            }
        })
})

const onSearchSelect = (value: string | number) => {
    console.log(value);
    /* set addingAdmin on select */
    const temp = volunteerList.value.find(user => user.userid === Number(value));
    if (typeof temp === 'undefined') return;
    addingAdmin.value = temp;
    console.log(' add', addingAdmin.value);
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
            {
                default: () => h(NIcon,
                    {},
                    { default: () => h(Edit) }
                )
            }
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

    <!-- add -->
    <div class="admin-header">
        <div class="flex flex-col justify-center align-center">
            <n-text>
                管理员列表
            </n-text>
            </div>
        <div class="add-admin-input">
            <n-button v-if="!isAdding" @click="isAdding = true" type="primary" class="square-btn">
                <n-icon size="18">
                    <add-outline />
                </n-icon>
            </n-button>

            <div v-else key=1 class="flex">
                <n-button @click="isAdding = false; addAdminInput=''" type="error" class="rounded-r-none square-btn">
                    <n-icon size="18">
                        <close-outline />
                    </n-icon>
                </n-button>
                <n-auto-complete
                    class="min-w-55"
                    v-model:value="addAdminInput"
                    :options="searchOptions"
                    :on-select="onSearchSelect"
                    placeholder="输入用户ID, 或用姓名/学号查找"
                />
                <n-button @click="doAddAdmin" type="primary" class="rounded-l-none square-btn">
                    <n-icon size="18">
                        <checkmark-outline />
                    </n-icon>
                </n-button>
            </div>
        </div>
    </div>

    

    <!-- table -->
    <div class="table-container">
        <n-data-table
            ref="table"
            :columns="columns"
            :data="adminList"
            :loading="adminLoading"
            :scroll-x="1000"
            @update:sorter="handleSorterChange"
            striped
        />
    </div>

    <!-- editDrawer -->
    <n-drawer placement="right" :auto-focus="false" v-model:show="isEditing" close-on-esc>
        <n-drawer-content title="编辑管理员">
            <n-form ref="formRef" :model="editingAdmin">
                <n-form-item label="ID" path="userid">
                    <n-input :disabled="true" :value="userIdComputed" />
                </n-form-item>
                <n-form-item label="姓名" path="userName">
                    <n-input v-model:value="editingAdmin.userName" />
                </n-form-item>
                <n-form-item label="学号" path="confirmPassword">
                    <n-input v-model:value="editingAdmin.studentId" />
                </n-form-item>
                <n-form-item label="手机" path="phoneNumber">
                    <n-input v-model:value="editingAdmin.phoneNumber" />
                </n-form-item>
                <n-form-item label="邮箱" path="email">
                    <n-input v-model:value="editingAdmin.email" />
                </n-form-item>
                <n-form-item label="身份" path="identity">
                    <n-input v-model:value="editingAdmin.identity" />
                </n-form-item>
                <n-form-item label="部门" path="department">
                    <n-input v-model:value="editingAdmin.department" />
                </n-form-item>
                <n-button @click="doSubmitAdmin" class="drawer-btn" type="success">提交</n-button>
            </n-form>

            <n-popconfirm @positive-click="doDeleteAdmin" positive-text="确定" negative-text="取消">
                <template #trigger>
                    <n-button type="error" class="drawer-btn">删除管理员</n-button>
                </template>
                确定要删除管理员 {{ editingAdmin.userName }} 吗？
            </n-popconfirm>
        </n-drawer-content>
    </n-drawer>
</template>

<style scoped>
.drawer-btn {
    width: 100%;
    margin-top: 4px;
    margin-bottom: 24px;
}

.table-container {
    @apply flex justify-around;
}

.add-admin-input {
    @apply flex justify-end;
    margin: 15px;
    flex: none;
}

.square-btn {
    aspect-ratio: 1 / 1;
}

.admin-header {
    @apply flex justify-end;
}
</style>

<style> /* Overriding styles */
.add-admin-input .n-input__border,
.add-admin-input .n-input__state-border{
    @apply rounded-none;
}
</style>