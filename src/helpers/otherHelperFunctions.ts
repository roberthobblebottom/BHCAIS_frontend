export function formatOption(option: string) {
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

        return option2 + "s"
    }
}