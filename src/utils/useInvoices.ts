export default function () {
    function get(amount: number) {
        if (!process.env.PROVIDER_TOKEN) {
            throw new Error('No provider token is provided')
        }

        return {
            provider_token: process.env.PROVIDER_TOKEN,
            start_parameter: 'premium',
            title: 'Премиум',
            description:
                'Покупая премиум подписку Вы получаете возможность возвращаться к случайно пропущенным анкетам',
            currency: 'RUB',
            prices: [
                {
                    label: 'Премиум подписка на 30 дней',
                    amount: 100 * amount
                }
            ],
            payload: 'premium'
        }
    }

    return {
        get
    }
}
