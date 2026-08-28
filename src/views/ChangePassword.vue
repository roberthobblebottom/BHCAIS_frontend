<template>
    <div class="small common">

        <q-form validation-observer @submit.prevent="onSubmit">
            <h3>Change Password</h3>

            <div class="form-group">
                <q-input name="oldPassword" label="Old Password" type="password" class="form-control"
                    v-model="oldPassword" v-bind="oldPasswordProps" />
            </div>
            <div class="form-group">
                <q-input name="newPassword" label="New Password" type="password" class="form-control "
                    v-model="newPassword" v-bind="newPasswordProps" />
            </div>
            <div class="form-group">
                <q-input name="confirmNewPassword" label="Confirm New Password" type="password" class="form-control "
                    v-model="confirmNewPassword" v-bind="confirmNewPasswordProps" />
            </div>
            <div class="justify-center">

                <button class="button btn-primary" :disabled="isSubmitting">
                    <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                    <i class="fa-solid fa-pen-to-square"></i> Change
                </button>
            </div>
        </q-form>
        <q-dialog v-model="showAlert" backdrop-filter="blur(4px)">
            <q-card-section class="column items-center 
            q-pb-none text-h6 dialog ">
                <h3>{{ alertMessage }}</h3>
                <q-btn label="Ok" color="primary" v-close-popup />
            </q-card-section>

        </q-dialog>
    </div>
</template>
<style scoped>
@import '../../public/css/login.css';
@import '../../public/css/main-content-variants.css';
@import '../../public/css/dialog.css';

.invalid-feedback {
    color: red;
}
</style>

<script setup lang='ts'>
import { useForm } from 'vee-validate';
import * as Yup from 'yup';
import { fetchWrapper } from '../helpers/fetch-wrapper.ts';
import { passwordError, passwordRegex } from '../constants.ts';
import commonPasswords from '../common-passwords.txt?raw'
import { ref, type MaybeRefOrGetter } from 'vue';
import { useAuthStore } from '../stores/auth.store.ts';
const showAlert = ref(false)
const alertMessage = ref('')
const isSubmitting = ref(false)
const schema = Yup.object().shape({
    oldPassword: Yup.string().required('required'),
    //temporary changed to one min char
    newPassword: Yup.string()
        .min(7, 'minimum of 7 characters for password   ')
        .matches(passwordRegex, passwordError)
        // ,
        .notOneOf(commonPasswords.split("\n"), "The password is too common"),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword'), ""], "New Passwords must match.")
});
const { defineField, handleSubmit, resetForm } = useForm({
    validationSchema: schema,
    initialValues: {
        terms: false,
    },
});

const quasarConfig = (state: any) => ({
    props: {
        error: !!state.errors[0],
        'error-message': state.errors[0],
    },
});


const [oldPassword, oldPasswordProps] = defineField("oldPassword" as MaybeRefOrGetter, quasarConfig)
const [newPassword, newPasswordProps] = defineField("newPassword" as MaybeRefOrGetter, quasarConfig)
const [confirmNewPassword, confirmNewPasswordProps] = defineField("confirmNewPassword" as MaybeRefOrGetter, quasarConfig)
const onSubmit = handleSubmit(async (values) => {
    const url = `${import.meta.env.VITE_API_URL}/ChangePassword/`
    let response = null
    try {
        response = await fetchWrapper.post(url, {
            'username': useAuthStore().user.email,
            'old_password': oldPassword.value,
            'new_password': newPassword.value,

            'confirm_new_password': confirmNewPassword.value
        })
    } catch (error: any) {
        alertMessage.value = "ERROR: " + error.toString()
        showAlert.value = true
    } finally {

        resetForm()
    }
    if (response != null) {
        alertMessage.value = "sucessfully changed password"
        showAlert.value = true;
    }


})
</script>
