export type GeneratorOptions = {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
};
export const passwordPrefix =
    document.querySelector<HTMLMetaElement>(
        'meta[name="vault-password-prefix"]',
    )?.content ?? "";
export const minimumPasswordLength = Math.max(8, passwordPrefix.length + 8);
export const defaultOptions: GeneratorOptions = {
    length: Math.max(20, minimumPasswordLength),
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
};
function randomIndex(max: number): number {
    const bytes = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / max) * max;
    do {
        crypto.getRandomValues(bytes);
    } while (bytes[0] >= limit);
    return bytes[0] % max;
}
export function generatePassword(options: GeneratorOptions): string {
    const prefix = passwordPrefix;
    const groups = [
        options.uppercase ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "",
        options.lowercase ? "abcdefghijkmnopqrstuvwxyz" : "",
        options.numbers ? "23456789" : "",
        options.symbols ? "!@#$%^&*()-_=+[]{}?" : "",
    ].filter(Boolean);
    if (!groups.length) throw new Error("Choose at least one character type.");
    const all = groups.join("");
    const result = groups.map((group) => group[randomIndex(group.length)]);
    while (result.length < options.length - prefix.length)
        result.push(all[randomIndex(all.length)]);
    for (let i = result.length - 1; i > 0; i--) {
        const j = randomIndex(i + 1);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return prefix + result.join("");
}
export function passwordStrength(password: string): {
    label: string;
    score: number;
} {
    if (!password) return { label: "No password", score: 0 };
    const types = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((type) =>
        type.test(password),
    ).length;
    const score =
        password.length >= 16 && types >= 3
            ? 4
            : password.length >= 12 && types >= 2
              ? 3
              : password.length >= 8
                ? 2
                : 1;
    return { label: ["", "Weak", "Fair", "Good", "Strong"][score], score };
}
