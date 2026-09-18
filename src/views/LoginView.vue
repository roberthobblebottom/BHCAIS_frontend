<template>
    <div class="content">

        <q-form @submit.prevent="onSubmit" validation-observer>
            <h1>BHCAIS</h1>
            <h2>Login</h2>
            <div v-if="apiError" class="alert alert-danger mt-3 mb-0">{{ apiError }}
            </div>
            <q-input label="email" name="email" type="text" class="form-control" v-model="email" v-bind="emailProps" />

            <q-input label="password" name="password" type="password" class="form-control " v-model="password"
                v-bind="passwordProps" />
            <button type="submit" class="button btn-primary" :disabled="isSubmitting">
                <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                Login
            </button>
        </q-form>
    </div>
</template>
<style>
/**do not scope this style block **/

@import '../../public/css/login.css';

.alert {
    color: red;
}
</style>

<script setup lang='ts'>
import { useForm } from 'vee-validate';
import * as Yup from 'yup';
import { useAuthStore } from '../stores/auth.store.ts';
import { type MaybeRefOrGetter, ref } from 'vue';
const isSubmitting = ref(false)
const apiError = ref("")

const schema = Yup.object().shape({
    email: Yup.string().email('Not a valid email format').required('email is required'),
    password: Yup.string().required('Password is required')
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
const [email, emailProps] = defineField("email" as MaybeRefOrGetter, quasarConfig)
const [password, passwordProps] = defineField("password" as MaybeRefOrGetter, quasarConfig)

const onSubmit = handleSubmit(async (_values) => {
    const authStore = useAuthStore();
    apiError.value = ""
    await authStore.login(email.value, password.value)
        .catch(error => {

            apiError.value = error
            return error
        });

    resetForm()
})
</script>
