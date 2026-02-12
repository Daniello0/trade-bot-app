import {number, object, string} from "yup";

const createGridSettingsSchema = object({
    lowerBoundDynamic: string().required("Укажите нижнюю границу"),
    upperBoundDynamic: string().required("Укажите верхнюю границу"),
});

const createLevelsSettingsSchema = object({
    countStatic: number()
        .typeError("Должно быть числом")
        .required("Обязательно")
        .positive("Должно быть > 0")
        .integer('Должно быть целое'),
    pricePerBetStatic: number()
        .typeError("Должно быть числом")
        .required("Обязательно")
        .positive("Должно быть > 0")
        .test(
            'check-max-price',
            'Сумма всех ставок превышает депозит',
            function (value: number) {
                const { countStatic } = this.parent;

                if (!this.from) return true;

                const root: any = this.from[this.from.length - 1].value;
                const deposit: number = root?.deposit;

                if (!value || !countStatic || !deposit) {
                    return true;
                }

                return (value * countStatic) <= deposit;
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