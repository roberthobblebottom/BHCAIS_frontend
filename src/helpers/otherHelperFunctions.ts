export function format1(option: string, addSChar = true) {
    // turns underscores to spaces, capitalises first letter and add pural if stated by addSChar
    if (option == "")
        return ""

    else if (option == 'oral_history')
        return 'Oral Histories'
    else {
        let option2 = option.trim().replaceAll("_", " ").split(" ").map(
            (word: string) => {
                return word[0]?.toUpperCase() + word.substring(1)
            }
        ).join(" ")

        return addSChar ? option2 + "s" : option2
    }
}