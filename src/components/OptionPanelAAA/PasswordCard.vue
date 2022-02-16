<script setup lang="ts">
import { NCard, NButton, NInput, NForm, NFormItem } from 'naive-ui';

import { handleError } from '~/composables/error';

import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';

import { changePassword } from '~/api/login';


const router = useRouter();
const message = useMessage();

/* password */
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const doChangePassword = async () => {
    try {
        await changePassword(oldPassword.value, newPassword.value);
        message.success('修改密码成功');
    } catch (e) {
        handleError(e, message, router);
    }
}

const formRef = ref(null);
const formValue = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
});
const formRules = {
    oldPassword: [
        { required: true, message: '请输入旧密码' },
    ],
    newPassword: [
        { required: true, message: '请输入新密码' },
        { min: 6, message: '密码长度不能小于6位' },
    ],
    confirmPassword: [
        { required: true, message: '请输入确认密码' },
        {
            validator(rule, value) {
                if (value !== formValue.value.newPassword) {
                    return new Error('两次输入的密码不一致');
                } else {
                    return true;
                }
            }
        },
    ],
};

const onSubmit = () => {
    formRef.value.validate(async (errors) => {
        if (!errors) {
            await doChangePassword();
        } else {
            console.log(errors);
            message.error('请检查表单');
        }
    });
}
</script>

<template>
    <n-card title="更改密码" content-style="padding: 0px;">
        <template #action>
            <n-form ref="formRef" :model="formValue" :rules="formRules">
                <n-form-item label="原密码" path="oldPassword">
                    <n-input
                        type="password"
                        placeholder=""
                        v-model:value="formValue.oldPassword"
                        show-password-on="mousedown"
                    />
                </n-form-item>
                <n-form-item label="新密码" path="newPassword">
                    <n-input
                        type="password"
                        placeholder=""
                        v-model:value="formValue.newPassword"
                        show-password-on="mousedown"
                    />
                </n-form-item>
                <n-form-item label="确认密码" path="confirmPassword">
                    <n-input
                        type="password"
                        placeholder=""
                        v-model:value="formValue.confirmPassword"
                        show-password-on="mousedown"
                    />
                </n-form-item>
                <n-button
                    @click="onSubmit"
                    style="width: 100%"
                    :disabled="!formValue.oldPassword || !formValue.newPassword"
                >更改密码</n-button>
            </n-form>
        </template>
    </n-card>
</template>