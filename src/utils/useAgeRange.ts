export default function () {
    function get(value: string) {
        const [from, to] = value.split(',').map(Number)
        return {
            from,
            to
        }
    }

    return {
        get
    }
}
