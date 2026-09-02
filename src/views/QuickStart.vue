<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();
storeToRefs(authStore);
</script>

<template>
    <v-container class="medium common">
        <v-row>

            <h1>Welcome to BHCAIS</h1>
        </v-row>
        <v-row>

            <h2>Quick Start:</h2>
        </v-row>
        <v-row>

            <p>
                BHCAIS(beh - kaEYEs) is a intermediate system to store information from Excel or CSV files
                before being transformed and stored in BIG, LKCNHM's Institutional truth layer system.

            </p>

            <p>
                There are 6 catalogues types: "Print", "Oral History" , "Negatives" , "Library and Archives" and
                "Legacy and
                Miscelleneous Items Reports". </p>

            <p>
                You can traverse the system via the sidebar on the left.
                You may change the password on the <img src="../../public/images/change-password.png"
                    alt="Change Password" /> link on the sidebar.
            </p>
            <p v-if="authStore.user.user_type == 'admin'">
                As admins you may Manage users by clicking on <img alt="User
                Management" src="../../public/images/user-management.png"></img> on the sidebar.
                It will bring you to the page that shows all users and all of their details.

                You can click on <img src="../../public/images/create-user.png" alt="Create User" /> to create new
                users.
                You can edit or delete individual users by clicking on <img
                    src="../../public/images/edit-and-delete-user-buttons.png" alt="Edit or Delete" /> buttons on the
                user's
                individual row.

            </p>
            <p>
                To upload data, Click on the <img alt="Bulk Data Upload"
                    src="../../public/images/bulk-data-upload.png" />on the sidebar
                Choose which file to upload by using the file picker dialog or by dragging and dropping.
                Only CSV or Excel files are accepted.
                The system will automatically check if the headers are correct and they are not empty or headers only
                files
                Click on the Upload Files to upload the files given.
            </p>
            <p>
                To View Files, click on "Catalogoues" on the sidebar. click on the drop down selector and choose a
                catalogue.
                You may sort by individual column, search for a term in any of the columns,

                hide columns and even delete selected rows by checking on the rows and then click on "Delete Selected".

            </p>
            <p>
                You may download the catalogues by clicking on "Download Report(s)" on the sidebar.
                Select one or more catalogues that you want to download through the drop down selctor.
                You may optionally picking on the catalogue's fields and what you want to search on that field.
                You add more of such fields search terms options by clicking on the 'Add' button
                Finally press the "download" button which will download
                a uncompressed zip file with all the catalogues CSV files
                and the respective search terms contraints you have indicated.
                If there is no search results for given catalog or given search terms,
                no such csv will be downloaded.
            </p>
        </v-row>


    </v-container>
</template>
<style scoped>
@import "../../public/css/main-content-variants.css";

.common {
    height: 100%
}
</style>