import React, {useEffect, useState} from 'react';
import {NavigateFunction, useNavigate, useParams} from "react-router";
import { useForm, SubmitHandler } from 'react-hook-form';
import { SpotGridSettings } from './SpotGridSettings';
import './BotSettings.css';
import {createBot, getBot, updateBot} from "../../service/BotService";
import {
    CreateBot,
    CreateGridSettings,
    CreateLevelsSettings,
    CreateSpotGridSettings,
    ReadBotDetails
} from "../../api/Types";
import {mapReadBotToCreateBot} from "../../mapper/BotTypeMapper";

const gridSettings: CreateGridSettings = {
    lowerBoundDynamic: 'q1',
    upperBoundDynamic: 'q3',
};

const levelsSettings: CreateLevelsSettings = {
    countStatic: 10,
    pricePerBetStatic: 100,
};

const spotGridSettingsData: CreateSpotGridSettings = {
    candleLength: '1',
    crypto: 'BTC',
    gridSettings: gridSettings,
    levelsSettings: levelsSettings,
};

const values: CreateBot = {
    botType: 'spotGrid',
    name: 'My Bot',
    deposit: 1000,
    spotGridSettingsData: spotGridSettingsData,
    fullSpotSettingsData: undefined,
};

function BotSettings() {
    const navigate: NavigateFunction = useNavigate();

    const { register, control, handleSubmit, watch, setValue, reset } = useForm<CreateBot>({
        defaultValues: values,
    });

    const botType = watch('botType');
    const deposit = watch('deposit');

    const [isEditing, setIsEditing] = useState(false);
    const { botId } = useParams<{botId: string}>();

    useEffect(() => {
        (async () => {
            if (botId) {
                setIsEditing(true);
                console.log(botId);
                const botToEdit: ReadBotDetails = await getBot(parseInt(botId));
                console.log(botToEdit)
                reset(mapReadBotToCreateBot(botToEdit));
            }
        })()
    }, [botId, reset]);

    useEffect(() => {
        if (botType === 'spotGrid') {
            setValue('spotGridSettingsData', spotGridSettingsData);
            setValue('fullSpotSettingsData', undefined);
        } else if (botType === 'fullSpot') {
            setValue('spotGridSettingsData', undefined);
        }
    }, [botType, setValue]);

    const onCreate: SubmitHandler<CreateBot> = async (data: CreateBot) => {
        console.log("Отправляемые на бэкенд данные:", data);
        const error: Error | undefined = await createBot(data);
        if (error) {
            alert(error.message);
            return;
        }
        navigate("/");
    };

    const onUpdate: SubmitHandler<CreateBot> = async (data: CreateBot) => {
        console.log("Данные для обновления:", data);
        if (!botId) {
            alert("Ошибка при создании бота");
            return;
        } else {
            const error: Error | undefined = await updateBot(parseInt(botId), data);
            if (error) {
                alert(error.message);
            }
            navigate("/");
        }
    }

    return (
        <div className="bot-settings-page">
            <form className="bot-settings-form" onSubmit={isEditing? handleSubmit(onUpdate) : handleSubmit(onCreate)}>
                <h1>{isEditing? "Редактирование бота" : "Создание бота"}</h1>

                <fieldset className="form-section">
                    <legend>Общие</legend>
                    <div className="form-group">
                        <label htmlFor="name">Имя</label>
                        <input type="text" {...register('name', { required: "Имя обязательно" })} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="deposit">Депозит, $</label>
                        <input type="number" {...register('deposit', { required: "Депозит обязателен", valueAsNumber: true })} min="0" />
                    </div>
                </fieldset>

                {!isEditing && (
                    <fieldset className="form-section">
                        <legend>Тип бота</legend>
                        <div className="radio-group horizontal">
                            <label><input type="radio" {...register('botType')} value="spotGrid" /> Spot Grid Bot</label>
                            <label><input type="radio" {...register('botType')} value="fullSpot" /> Full Spot Bot</label>
                        </div>
                    </fieldset>
                )}

                {botType === 'spotGrid' && <SpotGridSettings control={control} watch={watch} setValue={setValue} deposit={deposit} />}
                {botType === 'fullSpot' && <h2>Временно недоступен</h2>}

                <div className="form-actions">
                    <button type="button" className="action-button secondary" onClick={() => navigate(-1)}>Назад</button>
                    <button type="submit" className="add-bot-button">{isEditing? "Сохранить" : "Создать"}</button>
                </div>
            </form>
        </div>
    );
}

export default BotSettings;