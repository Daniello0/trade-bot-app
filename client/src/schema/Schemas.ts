import {number, object, string} from "yup";

const ERRORS = {
    REQUIRED: "Обязательно",
    NUMBER: "Должно быть числом",
    POSITIVE: "Должно быть > 0",
};

const createGridSettingsSchema = object({
    lowerBoundDynamic: string().required("Укажите нижнюю границу"),
    upperBoundDynamic: string().required("Укажите верхнюю границу"),
});

const createLevelsSettingsSchema = object({
    countStatic: number()
        .typeError(ERRORS.NUMBER)
        .required(ERRORS.REQUIRED)
        .positive(ERRORS.POSITIVE)
        .integer('Должно быть целое'),
    pricePerBetStatic: number()
        .typeError(ERRORS.NUMBER)
        .required(ERRORS.REQUIRED)
        .positive(ERRORS.POSITIVE)
        .test(
            'check-max-price',
            'Сумма всех ставок превышает депозит',
            function (price: number) {
                const root = this.from?.find(f => f.value && 'deposit' in f.value)?.value;
                const { countStatic } = this.parent;
                const deposit: number = root?.deposit;

                if (!price || !countStatic || !deposit) return true;

                return (price * countStatic) <= deposit;
            }
        ),
});

const createSpotGridSettingsSchema = object({
    candleLength: string().required("Выберите период свечи"),
    crypto: string().required("Выберите криптовалюту"),
    gridSettings: createGridSettingsSchema.required(),
    levelsSettings: createLevelsSettingsSchema.required(),
});

export const createBotSchema = object({
    name: string().required("Имя обязательно"),
    deposit: number()
        .required("Депозит обязателен")
        .positive("Не может быть отрицательным")
        .typeError('Должно быть числом'),
    botType: string().required(),
    spotGridSettingsData: createSpotGridSettingsSchema.optional().nullable().default(undefined),
    fullSpotSettingsData: createSpotGridSettingsSchema.optional().nullable().default(undefined),
});