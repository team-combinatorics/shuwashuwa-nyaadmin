export const parseToken = (token: string) => {
    const [jwt, meta, sig] = token.split(".");
    const decoded = atob(meta);
    return JSON.parse(decoded);
}