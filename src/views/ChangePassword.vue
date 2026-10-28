<template>
    <div class="common ">
        <q-form class="flex column" validation-observer>
            <h3>Change Password</h3>

            <div class="flex justify-center">
                <q-input label="Old Password" :type="showPassword ? 'text' : 'password'" name="oldPassword"
                    v-model="oldPassword" v-bind="oldPasswordProps">
                    <template v-slot:append>
                        <q-icon class="cursor-pointer" :name="showPassword ? 'visibility_off' : 'visibility'"
                            @click="showPassword = !showPassword" />
                    </template>
                </q-input>
            </div>

            <div class="flex justify-center">
                <q-input label="New Password" :type="showNewPassword ? 'text' : 'password'" name="newPassword"
                    v-model="newPassword" v-bind="newPasswordProps">
                    <template v-slot:append>
                        <q-icon class="cursor-pointer" :name="showNewPassword ? 'visibility_off' : 'visibility'"
                            @click="showNewPassword = !showNewPassword" />
                    </template>
                </q-input>
            </div>
            <div class="flex justify-center">
                <q-input label="Confirm New Password" :type="showConfirmNewPassword ? 'text' : 'password'"
                    name="confirmNewPassword" v-model="confirmNewPassword" v-bind="confirmNewPasswordProps">
                    <template v-slot:append>
                        <q-icon class="cursor-pointer" :name="showConfirmNewPassword ? 'visibility_off' : 'visibility'"
                            @click=" showConfirmNewPassword = !showConfirmNewPassword" />
                    </template>
                </q-input>
            </div>
            <div class="flex justify-end">
                <q-btn class="q-mt-sm" color="blue" size='md' :disable='isSubmitting' @click.prevent="onSubmit">
                    <q-icon size="sm" class="q-mr-sm" :name="isSubmitting
                        ? 'fa-solid fa-spinner fa-spin-pulse'
                        : 'fa-regular fa-pen-to-square'
                        "></q-icon>
                    Change
                </q-btn>
            </div>
        </q-form>

        <q-dialog backdrop-filter="blur(4px)" v-model="showAlertDialog">
            <q-card-section class="column items-center q-pb-none dialog ">
                <q-avatar v-if="isError" icon="error" color="primary" text-color="white" />
                <q-avatar v-else icon="check" color="primary" text-color="white" />

                <div class="q-mt-md"> {{ alertMessage }}</div>

                <q-btn label="Ok" color="primary" size="md" class="q-mt-md" v-close-popup />
            </q-card-section>
        </q-dialog>
    </div>
</template>

<style scoped>
@import '../../public/css/main-content-variants.css';
@import '../../public/css/dialog.css';

.common {
    max-width: 250px;
}

.invalid-feedback {
    color: red;
}
</style>


<script setup lang='ts'>
import { useForm } from 'vee-validate'
import * as Yup from 'yup'
import { fetchWrapper } from '../helpers/fetch-wrapper.ts'
import { passwordError, passwordRegex } from '../constants.ts'
import commonPasswords from '../common-passwords.txt?raw'
import { ref, type MaybeRefOrGetter } from 'vue'
import { useAuthStore } from '../stores/auth.store.ts'
import { QBtn } from 'quasar'

QBtn.props.noCaps = { type: Boolean, default: true }


const showAlertDialog = ref(false)
const alertMessage = ref('')

const isSubmitting = ref(false)

const showPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmNewPassword = ref(false)

const isError = ref(false)

const schema = Yup.object().shape({
    oldPassword: Yup.string().required('Required'),
    newPassword: Yup.string()
        .min(7, 'Minimum of 7 characters for password   ')
        .matches(passwordRegex, passwordError)
        // ,
        .notOneOf(commonPasswords.split("\n"), "The password is too common"),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword'), ""], "New Passwords must match.")
})

const { defineField, handleSubmit, resetForm } = useForm({
    validationSchema: schema,
    initialValues: {
        terms: false,
    },
})

const quasarConfig = (state: any) => ({
    props: {
        error: !!state.errors[0],
        'error-message': state.errors[0],
    },
})

const [oldPassword, oldPasswordProps] = defineField("oldPassword" as MaybeRefOrGetter, quasarConfig)
const [newPassword, newPasswordProps] = defineField("newPassword" as MaybeRefOrGetter, quasarConfig)
const [confirmNewPassword, confirmNewPasswordProps] = defineField("confirmNewPassword" as MaybeRefOrGetter, quasarConfig)

const onSubmit = handleSubmit(async (_values) => {
    /**
     * Sent password details to server and handles UI 
     */

    isSubmitting.value = true
    const url = `${import.meta.env.VITE_API_URL}/ChangePassword/`
    let response = null

    response = await fetchWrapper.put(url, {
        'username': useAuthStore().user.email,
        'old_password': oldPassword.value,
        'new_password': newPassword.value,
        'confirm_new_password': confirmNewPassword.value,
        'token': useAuthStore().user.token
    }).catch((error) => {
        //Show Email Dialog
        alertMessage.value = "ERROR: " + error.toString()
        showAlertDialog.value = true
        isError.value = true
    }).finally(() => { resetForm() })

    //Show Success Dialog
    if (response != null) {
        alertMessage.value = "Sucessfully changed password"
        showAlertDialog.value = true
        isError.value = false
    }

    isSubmitting.value = false
})
</script>
