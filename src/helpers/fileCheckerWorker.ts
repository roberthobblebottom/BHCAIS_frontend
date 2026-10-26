import {
    printSQLFieldNames,
    oralHistoriesSQLFieldNames,
    negativeSQLFieldNames,
    slideSQLFieldNames,
    libraryAndArchivesSQLFieldNames,
    legacyAndMiscellaneousItemsReportSQLFieldNames,
    collectionSQLFieldNames,

} from '../constants'
import * as xlsx from 'xlsx'

function _send_message_back(name_of_file_with_headers_only: string, name_of_file_with_incorrect_header: string, name_of_file_with_missing_serial_number: string) {
    //this function may send back files with validation violations, if not they will be empty strings below:
    self.postMessage({
        name_of_file_with_headers_only: name_of_file_with_headers_only,
        name_of_file_with_incorrect_headers: name_of_file_with_incorrect_header,
        name_of_file_with_missing_serial_number: name_of_file_with_missing_serial_number
    })
}

function isHeadersCorrect(headersString: string, fileName: string) {
    if (headersString != printSQLFieldNames.join(",")
        && headersString != negativeSQLFieldNames.join(",")
        && headersString != slideSQLFieldNames.join(",")
        && headersString != libraryAndArchivesSQLFieldNames.join(",")
        && headersString != oralHistoriesSQLFieldNames.join(',')
        && headersString != legacyAndMiscellaneousItemsReportSQLFieldNames.join(",")
        && headersString != collectionSQLFieldNames.join(",")
    ) {
        _send_message_back("", fileName, '')
        return false
    }
    return true
}

self.onmessage = (event: MessageEvent) => {
    const file = event.data.file

    const reader = new FileReader()
    if (file.name.includes('.xlsx')) {
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = xlsx.read(data, { type: 'array', dense: true })
            const sheetName = workbook.SheetNames[0]!
            const worksheet: any = workbook.Sheets[sheetName]

            let tempHeadersValues: any[] = xlsx.utils.sheet_to_json(worksheet, {
                header: 1,
                blankrows: false
            })

            const headers: Object = tempHeadersValues[0]!
            const firstRow: string[][] = tempHeadersValues[1]!
            const content: any[][] = tempHeadersValues.slice(1)

            const headersString: string = Object.values(headers).map(
                (col: string) => col.trim().toLocaleLowerCase().replaceAll(" ", "_"))
                .toString().replace(",,", ",")
            console.log('headersString', headersString)
            if (!isHeadersCorrect(headersString, file.name))
                return
            const isInvalidContent = (firstRow == null) ? true : firstRow.length == 0 ? true : false
            if (isInvalidContent) {
                _send_message_back(file.name, '', '')
            }

            for (const row of content) {
                const serialNumber = row[0]
                if (serialNumber === undefined || serialNumber === '') {
                    _send_message_back('', '', file.name)
                    return
                }
            }

            _send_message_back('', '', '')
        }
        reader.readAsArrayBuffer(file)
    } else if (file.name.includes('.csv')) {
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const csv = e.target?.result as string
            let headersString = csv.split('\n')[0]?.split(",")
                .map(col => col.trim().toLocaleLowerCase().replaceAll(" ", "_")).toString().replace(",,", ",")

            if (!isHeadersCorrect(headersString!, file.name))
                return
            const content = csv.split('\n').slice(2)
            if (content.length == 1 || content[0]?.trim() == "" || content[0] == null) {
                _send_message_back(file.name, '', '')
            } else if (!content[0]!.includes(',')) {
                _send_message_back(file.name, '', '')
            }

            for (const row of content) {
                if (row == "")
                    continue
                const serialNumber = row.split(",")[0]

                console.log('row', row)
                console.log('serialNumber', serialNumber)
                if (serialNumber == "" || serialNumber == null) {
                    _send_message_back('', '', file.name)
                    return
                }

            }
            _send_message_back('', '', '')
        }
        reader.readAsText(file)
    }
}
