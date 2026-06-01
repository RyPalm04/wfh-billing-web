export function formatDate(value) {
    if (!value) {
        return 'N/A'
    }

    const [year, month, day] = value.split('-')
    
    return `${month}/${day}/${year}`
}