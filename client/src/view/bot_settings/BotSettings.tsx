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
import {mapReadBotToCreateBot} from "../../service/BotTypeMapper";

const gridSettings: CreateGridSettings = {
    type: 'static',
    lower_bound_static: 0,
    upper_bound_static: 0,
};

const levelsSettings: CreateLevelsSettings = {
    type: 'static',
    count_static: 10,
    price_per_bet_static: 100,
};

const spotGridSettingsData: CreateSpotGridSettings = {
    history_length: 100,
    candle_length: '5m',
    crypto: 'MNT',
    stop_loss_type: 'hard',
    update_grid_interval_type: 'byCandle',
    update_grid_interval_time: undefined,
    grid_settings: gridSettings,
    levels_settings: levelsSettings,
};

const values: CreateBot = {
    bot_type: 'spotGrid',
    name: 'My Bot',
    deposit: 1000,
    spot_grid_settings_data: spotGridSettingsData,
    full_spot_settings_data: undefined,
};

function BotSettings() {
    const navigate: NavigateFunction = useNavigate();

    const { register, control, handleSubmit, watch, setValue, reset } = useForm<CreateBot>({
        defaultValues: values,
    });

    const botType = watch('bot_type');
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
            setValue('spot_grid_settings_data', spotGridSettingsData);
            setValue('full_spot_settings_data', undefined);
        } else if (botType === 'fullSpot') {
            setValue('spot_grid_settings_data', undefined);
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
                            <label><input type="radio" {...register('bot_type')} value="spotGrid" /> Spot Grid Bot</label>
                            <label><input type="radio" {...register('bot_type')} value="fullSpot" /> Full Spot Bot</label>
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