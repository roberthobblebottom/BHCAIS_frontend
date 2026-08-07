<script setup lang='ts'>
import { Form, Field, type FormActions, type GenericObject } from 'vee-validate';
import * as Yup from 'yup';
import { useAuthStore } from '../stores/auth.store.ts';
const schema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required')
});

function onSubmit(values: GenericObject, { setErrors }: FormActions<GenericObject>) {
    const authStore = useAuthStore();
    const { username, password } = values;

} 
</script>
<style>
@import '../../public/css/login.css';
</style>
<template>
    <div class="login-content">

        <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
            <h1>Change Password</h1>

            <div class="form-group">
                <label>Old Password</label>
                <Field name="old-password" type="password" class="form-control "
                    :class="{ 'is-invalid': errors.password }" />
                <div class="invalid-feedback">{{ errors.password }}</div>
            </div>
            <div class="form-group">
                <label>New Password </label>
                <Field name="new-password" type="password" class="form-control "
                    :class="{ 'is-invalid': errors.password }" />
                <div class="invalid-feedback">{{ errors.password }}</div>
            </div>
            <div class="form-group">
                <label>Reconfirmed New Password </label>
                <Field name="confirm-new-password" type="password" class="form-control "
                    :class="{ 'is-invalid': errors.password }" />
                <div class="invalid-feedback">{{ errors.password }}</div>
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