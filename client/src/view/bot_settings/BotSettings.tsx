import React, { useEffect } from 'react';
import { useNavigate } from "react-router";
import { useForm, SubmitHandler } from 'react-hook-form';
import { BotConfig, SpotGridBotConfig } from '../../schema/BotSettings';
import { SpotGridSettings as SpotGridSettingsType } from '../../schema/SpotGridBot';
import { FullSpotSettings as FullSpotSettingsType } from '../../schema/FullSpotBot';
import { SpotGridSettings } from './SpotGridSettings';
import { FullSpotSettings } from './FullSpotSettings';
import './BotSettings.css';

const defaultSpotGridSettings: SpotGridSettingsType = {
    historyLength: 100,
    candleLength: '5m',
    crypto: 'MNT',
    gridSizeType: 'static',
    staticGrid: { lowerBound: 0, upperBound: 0 },
    autoGrid: undefined,
    levelCountType: 'static',
    staticLevels: { count: 10, pricePerBet: 100 },
    dynamicLevels: undefined,
    stopLossType: 'hard',
    updateGridIntervalType: 'byCandle',
    updateGridIntervalTime: undefined,
};

const defaultFullSpotSettings: FullSpotSettingsType = {
    ignoreList: 'USDC, USDT',
    maxActiveCryptos: 10,
    pricePerBet: 100,
    cryptoListType: 'auto',
    manualCryptoList: [],
    indicators: [],
    profitPerCrypto: 1.5,
    stopLossType: 'none',
    stopLossIntervalValue: undefined,
    stopLossTimeValue: undefined,
};

const defaultValues: SpotGridBotConfig = {
    botType: 'spotGrid',
    name: 'My Bot',
    deposit: 1000,
    settings: defaultSpotGridSettings,
};


function BotSettings() {
    const navigate = useNavigate();

    const { register, control, handleSubmit, watch, setValue } = useForm<BotConfig>({
        defaultValues: defaultValues as BotConfig,
    });

    const botType = watch('botType');
    const deposit = watch('deposit');

    useEffect(() => {
        if (botType === 'spotGrid') {
            setValue('settings', defaultSpotGridSettings);
        } else if (botType === 'fullSpot') {
            setValue('settings', defaultFullSpotSettings);
        }
    }, [botType, setValue]);

    const onSubmit: SubmitHandler<BotConfig> = (data) => {
        console.log("Сохраненные настройки бота:", data);
        alert("Настройки сохранены! (см. консоль)");
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
                        <label><input type="radio" {...register('botType')} value="spotGrid" /> Spot Grid Bot</label>
                        <label><input type="radio" {...register('botType')} value="fullSpot" /> Full Spot Bot</label>
                    </div>
                </fieldset>

                {botType === 'spotGrid' && <SpotGridSettings control={control} watch={watch} setValue={setValue} deposit={deposit} />}
                {botType === 'fullSpot' && <FullSpotSettings control={control} watch={watch} setValue={setValue} />}

                <div className="form-actions">
                    <button type="button" className="action-button secondary" onClick={() => navigate(-1)}>Назад</button>
                    <button type="submit" className="add-bot-button">Сохранить</button>
                </div>
            </form>
        </div>
    );
}

export default BotSettings;