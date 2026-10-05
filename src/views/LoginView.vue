<template>
    <div class="small common ">

        <q-form @submit.prevent="onSubmit" validation-observer>
            <h3>BHCAIS</h3>
            <h3>Login</h3>
            <div v-if="apiError" class="alert alert-danger mt-3 mb-0">{{ apiError }}
            </div>
            <q-input label="Email" name="email" type="text" class="form-control" v-model="email" v-bind="emailProps" />

            <q-input label="Password" name="password" :type="showPassword ? 'text' : 'password'" class="form-control "
                v-model="password" v-bind="passwordProps">

                <template v-slot:append>
                    <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                        @click=" showPassword = !showPassword" />
                </template>
            </q-input>
            <q-btn size="md" color='primary' type="submit" class="button flexbox float-right" :disabled="isSubmitting">
                <q-icon :name="isSubmitting
                    ? 'fa-solid fa-spinner fa-spin-pulse'
                    : 'fa-solid fa-right-to-bracket'
                    " size="sm" class="q-mr-sm"></q-icon>
                Login

            </q-btn>
        </q-form>
    </div>
</template>
<style scoped>
/**do not scope this style block **/


@import '../../public/css/main-content-variants.css';

.alert {
    color: red;
}

h3 {
    margin-bottom: 0vh !important;
    margin-top: 5% !important;

}

.common {
    position: absolute;
    top: 10%;
    left: 25%;
}
</style>

<script setup lang='ts'>
import { useForm } from 'vee-validate'
import * as Yup from 'yup'
import { useAuthStore } from '../stores/auth.store.ts'
import { type MaybeRefOrGetter, ref } from 'vue'
const isSubmitting = ref(false)
const showPassword = ref(false)
const apiError = ref("")

const schema = Yup.object().shape({
    email: Yup.string().email('Not a valid email format').required('Email is required'),
    password: Yup.string().required('Password is required')
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
const [email, emailProps] = defineField("email" as MaybeRefOrGetter, quasarConfig)
const [password, passwordProps] = defineField("password" as MaybeRefOrGetter, quasarConfig)

const onSubmit = handleSubmit(async (_values) => {
    isSubmitting.value = true
    const authStore = useAuthStore()
    apiError.value = ""
    await authStore.login(email.value, password.value)
        .catch(error => {
            apiError.value = error
            return error
        })
    resetForm()
    isSubmitting.value = false
})
</script>
