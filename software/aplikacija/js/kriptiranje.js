export async function getPublicKey() {
    const response = await fetch("/public-key");
    return await response.text();
}