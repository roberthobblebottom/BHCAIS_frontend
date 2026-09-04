import { mdiConsoleLine } from '@quasar/extras/mdi-v7';
import {
    printSqlStringColumns,
    oralHistoriesSqlStringColumns,
    negativeSqlStringColumns,
    slideSqlStringColumns,
    libraryAndArchivesSqlStringColumns,
    legacyAndMiscellaneousItemsReportSqlStringColumns,

} from '../constants';
import * as xlsx from 'xlsx';
function _send_message_back(name_of_file_with_headers_only: string, name_of_file_with_incorrect_header: string) {
    self.postMessage({
        name_of_file_with_headers_only: name_of_file_with_headers_only,
        name_of_file_with_incorrect_headers: name_of_file_with_incorrect_header
    })
}
self.onmessage = (event: MessageEvent) => {
    const file = event.data.file;
    // const CHUNK_END_BYTES = event.data.CHUNK_END_BYTES;
    // const names_of_files_with_headers_only = event.data.names_of_files_with_headers_only
    // const names_of_files_with_incorrect_headers = event.data.names_of_files_with_incorrect_headers
    console.log('file name', file.name)
    const reader = new FileReader()
    if (file.name.includes('.xlsx')) {
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = xlsx.read(data, { type: 'array', sheetRows: 2 });
            const sheetName = workbook.SheetNames[0]!;
            const worksheet: any = workbook.Sheets[sheetName];

            // Extract headers (first row)
            let tempHeadersValues: any[] = xlsx.utils.sheet_to_json(worksheet, {
                header: 1
            })
            const headers: Object = tempHeadersValues[0]!
            const content: any[] = tempHeadersValues[1]!
            const headersString: string = Object.values(headers).map(
                (col: string) => col.trim().toLocaleLowerCase())
                .toString().replace(",,", ",")
            // console.log(headersString)
            // console.log(slideSqlStringColumns.join(","))
            if (headersString != printSqlStringColumns.join(",")
                && headersString != negativeSqlStringColumns.join(",")
                && headersString != slideSqlStringColumns.join(",")
                && headersString != libraryAndArchivesSqlStringColumns.join(",")
                && headersString != oralHistoriesSqlStringColumns.join(',')
                && headersString != legacyAndMiscellaneousItemsReportSqlStringColumns.join(",")
            ) {
                // fileUploaderRef.value.removeFile(file)
                // names_of_files_with_incorrect_headers.push(file.name)
                _send_message_back("", file.name)
                return
            }
            const isInvalidContent = (content == null) ? true : content.length == 0 ? true : false
            if (isInvalidContent) {
                // fileUploaderRef.value.removeFile(file)
                _send_message_back(file.name, '')
                return
            }
            _send_message_back('', '')
        }
        reader.readAsArrayBuffer(file)
    }
    else if (file.name.includes('.csv')) {
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const csv = e.target?.result as string
            let headersString = csv.split('\n')[0]?.split(",")
                .map(col => col.trim().toLocaleLowerCase()).toString().replace(",,", ",")
            // console.log(headersString)
            // console.log(slideSqlStringColumns.join(","))
            // console.log()
            if (headersString != printSqlStringColumns.join(",")
                && headersString != negativeSqlStringColumns.join(",")
                && headersString != slideSqlStringColumns.join(",")
                && headersString != libraryAndArchivesSqlStringColumns.join(",")
                && headersString != oralHistoriesSqlStringColumns.join(',')
                && headersString != legacyAndMiscellaneousItemsReportSqlStringColumns.join(",")
            ) {
                // fileUploaderRef.value.removeFile(file)
                // names_of_files_with_incorrect_headers.push(file.name)

                _send_message_back('', file.name)
                return
            }
            const content = csv.split('\n').slice(2)
            if (content.length == 1 || content[0]?.trim() == "" || content[0] == null) {
                // fileUploaderRef.value.removeFile(file)
                // names_of_files_with_headers_only.push(file.name)
                _send_message_back(file.name, '')
            } else if (!content[0]!.includes(',')) {
                _send_message_back(file.name, '')
                return
                // fileUploaderRef.value.removeFile(file)
                // names_of_files_with_headers_only.push(file.name)
            }
            _send_message_back('', '')
        }
        reader.readAsText(file)

    }
    // Read the file as an array buffer
}
