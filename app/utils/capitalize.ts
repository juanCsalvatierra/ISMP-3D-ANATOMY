export function capitalize(value: string): string {
    if(typeof value !== "string") return value;
    return value
        .trim()
        .split(/\s+/)
        .map(str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase())
        .join(" ");
}