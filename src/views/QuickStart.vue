<template>
    <v-container class="small common">
        <v-row>
            <h1>Welcome to BHCAIS</h1>
        </v-row>
        <v-row>
            <h2>Quick Start:</h2>
        </v-row>
        <v-row class="quick-start">
            <p>
                The Biodiversity Histories Consolidated Artifact Inventory System (BHCAIS) is an intermediate data
                staging platform. Allowing seamless uploading of artifact inventory data with minimal fuss and open
                flexible data formatting.
            </p>
            <p>

                Use the Navigation Menu located at the side of the screen to access the various functions.
            </p>
            <p>
                <img alt="User
                Management" src="../../public/images/user-management.png"></img> : (Admins Only) Add or remove access
                rights to the system.
            </p>
            <p>

                <img alt="Bulk Data Upload" src="../../public/images/bulk-data-upload.png" /> : Upload files by
                providing populated templates. Empty templates can be downloaded from here as well.
            </p>
            <p>
                <img alt="Catalogues" src="../../public/images/catalogues.png" /> : View data currently on the system.
                also select rows via checkboxes to delete entries.
            </p>
            <p>

                <img src="../../public/images/download-reports.png" alt="Download Report(s)" />
                : Download Data from the system. Search terms filters are also possible.
            </p>
            <!-- <p class="section">
                BHCAIS(beh - kaEYEs) is a intermediate system to store information from Excel or CSV files
                before being transformed and stored in BIG, LKCNHM's Institutional truth layer system.

                There are 6 catalogues types: "Print", "Oral History" , "Negatives" , "Library and Archives" and
                "Legacy and
                Miscelleneous Items Reports".
                You can traverse the system via the sidebar on the left.
                You may change the password on the <img src="../../public/images/change-password.png"
                    alt="Change Password" />
                link on the sidebar.
            </p>
            <p class="section" v-if="authStore.user.user_type == 'admin'">
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
            <p class="section">
                To upload data, Click on the <img alt="Bulk Data Upload"
                    src="../../public/images/bulk-data-upload.png" />on
                the sidebar
                Choose which file to upload by using the <img alt="file picker"
                    src="../../public/images/file-picker.png" />
                dialog or by dragging and dropping.
                Only CSV or Excel files are accepted.
                The system will automatically check if the headers are correct and they are not empty or headers only
                files
                Click on the <img alt="Upload Files" src="../../public/images/upload-files.png" /> to upload the files
                given. You also can download catalogues templates by clicking <img
                    src="../../public/images/download-templates.png">
            </p>
            <p>
                To View Files, click on
                <img alt="Catalogues" src="../../public/images/catalogues.png" /> on the sidebar. click on the <img
                    src="../../public/images/select-a-catalogue-to-view-delete.png" alt="drop
                down selector" /> and choose a
                catalogue.
                You may sort by individual column, search for a term in any of the columns <img
                    src="../../public/images/search.png">,

                hide columns and even delete selected rows by checking on the rows and then click on "Delete
                Selected".
            </p>
            <img src="../../public/images/selected-to-be-deleted.png">
            <p v-if="authStore.user.user_type == 'admin'">Admins could purge all data from the catalogues tables by
                clicking on <img src="../../public/images/purge all data.png" />.
                <b>Remember to go to <img src="../../public/images/download-reports.png" /> and backup all data.</b>
            </p>
            <div class="section"></div>
            <p class="section">
                You may download the catalogues by clicking on <img src="../../public/images/download-reports.png"
                    alt="Download Report(s)" /> on the sidebar.
                Select one or more catalogues that you want to download through the drop down selector <img
                    src="../../public/images/select-catalogues.png" />.
                You may optionally picking on the catalogue's fields and what you want to search on that field.
                You add more of such fields search terms options by clicking on the <img alt='Add'
                    src="../../public/images/add-search-term.png" /> button
                Finally press the <img alt="download" src="../../public/images/download.png" /> button which will
                download
                a uncompressed zip file with all the catalogues CSV files
                and the respective search terms contraints you have indicated.
                If there is no search results for given catalog or given search terms,
                no such csv will be downloaded.
            </p> -->
        </v-row>
    </v-container>
</template>
<style scoped>
@import "../../public/css/main-content-variants.css";

.large {
    height: 100%
}

.quick-start {
    /* display: grid;
    row-gap: 4%;*/
    height: 70vh;
    overflow: auto;
}


.section {
    border-bottom: 1px dotted grey;
}
</style>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();
storeToRefs(authStore);
</script>
