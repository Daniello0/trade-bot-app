import React, { useEffect } from 'react';
import {NavigateFunction, useNavigate} from "react-router";
import { useForm, SubmitHandler } from 'react-hook-form';
import { SpotGridSettings } from './SpotGridSettings';
import './BotSettings.css';
import { createBot } from "../../service/BotService";
import { CreateBot, CreateGridSettings, CreateLevelsSettings, CreateSpotGridSettings } from "../../api/Types";

const defaultGridSettings: CreateGridSettings = {
    type: 'static',
    lower_bound_static: 0,
    upper_bound_static: 0,
};

const defaultLevelsSettings: CreateLevelsSettings = {
    type: 'static',
    count_static: 10,
    price_per_bet_static: 100,
};

const defaultSpotGridSettingsData: CreateSpotGridSettings = {
    history_length: 100,
    candle_length: '5m',
    crypto: 'MNT',
    stop_loss_type: 'hard',
    update_grid_interval_type: 'byCandle',
    update_grid_interval_time: undefined,
    grid_settings: defaultGridSettings,
    levels_settings: defaultLevelsSettings,
};

const defaultValues: CreateBot = {
    bot_type: 'spotGrid',
    name: 'My Bot',
    deposit: 1000,
    spot_grid_settings_data: defaultSpotGridSettingsData,
    full_spot_settings_data: undefined,
};

function BotSettings() {
    const navigate: NavigateFunction = useNavigate();

    const { register, control, handleSubmit, watch, setValue } = useForm<CreateBot>({
        defaultValues,
    });

    const botType = watch('bot_type');
    const deposit = watch('deposit');

    useEffect(() => {
        if (botType === 'spotGrid') {
            setValue('spot_grid_settings_data', defaultSpotGridSettingsData);
            setValue('full_spot_settings_data', undefined);
        } else if (botType === 'fullSpot') {
            setValue('spot_grid_settings_data', undefined);
        }
    }, [botType, setValue]);

    const onSubmit: SubmitHandler<CreateBot> = async (data: CreateBot) => {
        console.log("Отправляемые на бэкенд данные:", data);
        const error: Error | undefined = await createBot(data);
        if (error) {
            alert(error.message);
        }
        navigate("/");
    };

    return (
        <div className="bot-settings-page">
            <form className="bot-settings-form" onSubmit={handleSubmit(onSubmit)}>
                <h1>Настройки ботов</h1>

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

                <fieldset className="form-section">
                    <legend>Тип бота</legend>
                    <div className="radio-group horizontal">
                        <label><input type="radio" {...register('bot_type')} value="spotGrid" /> Spot Grid Bot</label>
                        <label><input type="radio" {...register('bot_type')} value="fullSpot" /> Full Spot Bot</label>
                    </div>
                </fieldset>

                {botType === 'spotGrid' && <SpotGridSettings control={control} watch={watch} setValue={setValue} deposit={deposit} />}
                {botType === 'fullSpot' && <h2>Временно недоступен</h2>}

                <div className="form-actions">
                    <button type="button" className="action-button secondary" onClick={() => navigate(-1)}>Назад</button>
                    <button type="submit" className="add-bot-button">Сохранить</button>
                </div>
            </form>
        </div>
    );
}

export default BotSettings;