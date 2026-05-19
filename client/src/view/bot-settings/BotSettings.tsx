import React, {useEffect} from 'react';
import {NavigateFunction, useNavigate, useParams} from "react-router";
import {useForm, SubmitHandler, FormProvider, Resolver} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { SpotGridSettings } from './SpotGridSettings';
import './BotSettings.css';
import {createBot, getBot, updateBot} from "../../service/BotService";
import {
    CreateBot,
    ReadBotDetails
} from "../../api/Types";
import {mapReadBotToCreateBot} from "../../mapper/BotTypeMapper";
import {createBotSchema} from "../../schema/Schemas";
import {DEFAULT_SPOT_GRID_VALUES, INITIAL_BOT_FORM} from "../../constants/BotDefaults";
import {InfoTooltip} from "../../components/InfoTooltip";

function BotSettings() {
    const navigate: NavigateFunction = useNavigate();

    const methods = useForm<CreateBot>({
        defaultValues: INITIAL_BOT_FORM,
        resolver: yupResolver(createBotSchema) as Resolver<CreateBot>,
        mode: 'onChange'
    });

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = methods;

    const botType: string = watch('botType');

    const { botId } = useParams<{botId: string}>();
    const isEditing: boolean = Boolean(botId);

    useEffect(() => {
        (async () => {
            if (botId) {
                const botToEdit: ReadBotDetails = await getBot(parseInt(botId));
                reset(mapReadBotToCreateBot(botToEdit));
            }
        })()
    }, [botId, reset]);

    // SMELL: OOP – Switch Statements
    useEffect(() => {
        if (botType === 'spotGrid') {
            setValue('spotGridSettingsData', DEFAULT_SPOT_GRID_VALUES);
            setValue('fullSpotSettingsData', undefined);
        } else if (botType === 'fullSpot') {
            setValue('spotGridSettingsData', undefined);
        }
    }, [botType, setValue]);

    const onSubmit: SubmitHandler<CreateBot> = async (data: CreateBot) => {
        try {
            const error: Error | undefined = isEditing
                ? await updateBot(parseInt(botId!), data)
                : await createBot(data);

            if (error) throw error;
            navigate(-1);
        } catch (error: any) {
            alert(`Ошибка! ${error.message}`);
        }
    }

    // optimize: add input limit to deposit, pricePerBet, ...
    return (
        <div className="bot-settings-page">
            <FormProvider {...methods}>
                <form className="bot-settings-form" onSubmit={handleSubmit(onSubmit)}>
                    <h1>{isEditing ? "Редактирование бота" : "Создание бота"}</h1>

                    <fieldset className="form-section">
                        <legend>Общие</legend>
                        <div className="form-group">
                            <label>Имя</label>
                            <input type="text" {...register('name')} />
                            {errors.name && <span className="error-text">{errors.name.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>
                                <InfoTooltip text="Общая сумма ($), которую бот будет использовать для торговли."
                                             children="Депозит"/>
                            </label>
                            <input type="number" step="any" {...register('deposit')} />
                            {errors.deposit && <span className="error-text">{errors.deposit.message}</span>}
                        </div>
                    </fieldset>

                    {!isEditing && (
                        <fieldset className="form-section">
                            <legend>Тип бота</legend>
                            <div className="radio-group horizontal">
                                <label><input type="radio" {...register('botType')} value="spotGrid" /> Сеточный бот</label>
                                <label><input type="radio" {...register('botType')} value="fullSpot" /> Торговый бот</label>
                            </div>
                        </fieldset>
                    )}

                    // SMELL: OOP – Switch Statements
                    {botType === 'spotGrid' && <SpotGridSettings />}
                    {botType === 'fullSpot' && <h2>Временно недоступен</h2>}

                    <div className="form-actions">
                        <button type="button" className="action-button secondary" onClick={() => navigate(-1)}>Назад</button>
                        <button type="submit" className="add-bot-button">{isEditing ? "Сохранить" : "Создать"}</button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}

export default BotSettings;