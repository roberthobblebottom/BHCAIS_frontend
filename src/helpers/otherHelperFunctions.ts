export function format1(option: string, addSChar = true) {
    if (option == "")
        return ""
    else if (option == 'oral_history')
        return 'Oral Histories'
    else {
        let option2 = option.replaceAll("_", " ").split(" ").map(
            (word: string) => {
                return word[0]?.toUpperCase() + word.substring(1)
            }
        ).join(" ")

        return addSChar ? option2 + "s" : option2
    }
}