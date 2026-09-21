<template>
    <div class="small common">
        <q-form validation-observer>
            <h3>Change Password</h3>

            <div class="form-group">
                <q-input name="oldPassword" label="Old Password" class="form-control" v-model="oldPassword"
                    v-bind="oldPasswordProps" :type="showPassword ? 'text' : 'password'">
                    <template v-slot:append>
                        <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                            @click="showPassword = !showPassword" />
                    </template></q-input>
            </div>
            <div class="form-group">
                <q-input name="newPassword" label="New Password" :type="showNewPassword ? 'text' : 'password'"
                    class="form-control " v-model="newPassword" v-bind="newPasswordProps">
                    <template v-slot:append>
                        <q-icon :name="showNewPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                            @click="showNewPassword = !showNewPassword" />
                    </template>
                </q-input>
            </div>
            <div class="form-group">
                <q-input name="confirmNewPassword" label="Confirm New Password"
                    :type="showConfirmNewPassword ? 'text' : 'password'" class="form-control "
                    v-model="confirmNewPassword" v-bind="confirmNewPasswordProps">
                    <template v-slot:append>
                        <q-icon :name="showConfirmNewPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                            @click=" showConfirmNewPassword = !showConfirmNewPassword" />
                    </template>
                </q-input>
            </div>
            <div class="justify-center">
                <q-btn :disable='isSubmitting' class="button btn-primary" @click.prevent="onSubmit">
                    <i :class="isSubmitting
                        ? 'fa-solid fa-spinner fa-spin-pulse'
                        : 'fa-solid fa-pen-to-square'"></i>
                    Change
                </q-btn>
            </div>
        </q-form>

        <q-dialog v-model="showAlert" backdrop-filter="blur(4px)">
            <q-card-section class="column items-center 
            q-pb-none text-h6 dialog ">
                {{ alertMessage }}
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
const showPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmNewPassword = ref(false)
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

const onSubmit = handleSubmit(async (_values) => {
    isSubmitting.value = true
    const url = `${import.meta.env.VITE_API_URL}/ChangePassword/`
    let response = null
    try {
        response = await fetchWrapper.put(url, {
            'username': useAuthStore().user.email,
            'old_password': oldPassword.value,
            'new_password': newPassword.value,
            'confirm_new_password': confirmNewPassword.value,
            'token': useAuthStore().user.token
        })
    } catch (error: any) {
        alertMessage.value = "ERROR: " + error.toString()
        showAlert.value = true
    } finally { resetForm() }
    if (response != null) {
        alertMessage.value = "sucessfully changed password"
        showAlert.value = true;
    }

    isSubmitting.value = false
})
</script>
