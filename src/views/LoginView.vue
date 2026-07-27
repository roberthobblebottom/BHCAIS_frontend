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

    return authStore.login(username, password)
        .catch(error => setErrors({ apiError: error }));
}
</script>
<style>
@import '../../public/css/login.css';
h2 {
    text-align:center;
    margin-bottom: 20px;
}
</style>
<template>
    <div >
        
        <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
        <h2>Login</h2>
            <div class="form-group">
                <label>Username</label>
                <Field name="username" type="text" class="form-control" :class="{ 'is-invalid': errors.username }" />
                <div class="invalid-feedback">{{ errors.username }}</div>
            </div>
            <div class="form-group">
                <label>Password</label>
                <Field name="password" type="password" class="form-control "
                    :class="{ 'is-invalid': errors.password }" />
                <div class="invalid-feedback">{{ errors.password }}</div>
            </div>
            <div class="form-group">
                <button class="button btn-primary" :disabled="isSubmitting">
                    <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                    Login
                </button>
            </div>
            <div v-if="errors.apiError" class="alert alert-danger mt-3 mb-0">{{ errors.apiError }}</div>
        </Form>
    </div>
</template>