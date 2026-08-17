<script setup lang='ts'>
import { Form, Field, type FormActions, type GenericObject } from 'vee-validate';
import * as Yup from 'yup';
import { fetchWrapper } from '../helpers/fetch-wrapper.ts';
import { passwordError, passwordRegex } from '../constants.ts';
import commonPasswords from '../common-passwords.txt?raw'
const schema = Yup.object().shape({
    oldPassword: Yup.string().required('required'),
    //temporary changed to one min char
    newPassword: Yup.string().min(1, 'minimum of 7 characters for password   ')
        .matches(passwordRegex, passwordError)
        .notOneOf(commonPasswords.split("\n"), "The password is too common"),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword'), ""], "New Passwords must match.")
});

function onSubmit(values: GenericObject, { setErrors }: FormActions<GenericObject>) {
    const { oldPassword, newPassword, confirmNewPassword } = values;
    const url = import.meta.env.BASE_URL + "/"
    const response = fetchWrapper.post(url, {
        'old_passwrod': oldPassword,
        'new_password': newPassword,
        'confirm_new_password': confirmNewPassword
    })
    console.log(response)


} 
</script>
<style>
@import '../../public/css/login.css';
@import '../../public/css/main-content-variants.css'
</style>
<template>
    <div class="small common">

        <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
            <h1>Change Password</h1>

            <div class="form-group">
                <label>Old Password</label>
                <Field name="oldPassword" type="password" class="form-control"
                    :class="{ 'is-invalid': errors.oldPassword }" />
                <div class="invalid-feedback">{{ errors.oldPassword }}</div>
            </div>
            <div class="form-group">
                <label>New Password </label>
                <Field name="newPassword" type="password" class="form-control "
                    :class="{ 'is-invalid': errors.newPassword }" />
                <div class="invalid-feedback">{{ errors.newPassword }}</div>
            </div>
            <div class="form-group">
                <label>Reconfirmed New Password </label>
                <Field name="confirmNewPassword" type="password" class="form-control "
                    :class="{ 'is-invalid': errors.confirmNewPassword }" />
                <div class="invalid-feedback">{{ errors.confirmNewPassword }}</div>
            </div>
            <div class="form-group">
                <button class="button btn-primary" :disabled="isSubmitting">
                    <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                    change
                </button>
            </div>
            <div v-if="errors.apiError" class="alert alert-danger mt-3 mb-0">{{ errors.apiError }}</div>
        </Form>
    </div>
</template>