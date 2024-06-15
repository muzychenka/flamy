export default function () {
    const isPremiumActive = (premiumDate: number) => premiumDate >= Math.floor(Date.now() / 1000)

    return {
        isPremiumActive
    }
}
