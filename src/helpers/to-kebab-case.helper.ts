export function toKebabCase(input: string) {
    return input
        .match(/([A-Z0-9]+[a-z]*)/g)
        .join("-")
        .toLowerCase();
}
