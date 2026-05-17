import React from 'react';
import {useFormContext} from 'react-hook-form';
import './SpotGridSettings.css';
import { CreateBot } from "../../api/Types";
import {InfoTooltip} from "../../components/InfoTooltip";

export function SpotGridSettings() {
    const { register, watch, formState: { errors } } = useFormContext<CreateBot>();

    const deposit: number = watch('deposit') || 0;
    const candleLength: string | undefined = watch('spotGridSettingsData.candleLength');
    const staticLevelsCount: number = watch('spotGridSettingsData.levelsSettings.countStatic') || 1;

    const fieldErrors = errors.spotGridSettingsData?.levelsSettings;

    // SMELL: Bloaters – Primitive Obsession
    const lowerBoundOptions = [
        { value: 'min', label: 'min (Агрессивно)' },
        { value: '10%', label: '10% (Сбалансировано)' },
        { value: 'q1', label: 'Q1 (Консервативно)' }
    ];

    // SMELL: Bloaters – Primitive Obsession
    const upperBoundOptions = [
        { value: 'q3', label: 'Q3 (Консервативно)' },
        { value: '90%', label: '90% (Сбалансировано)' },
        { value: 'max', label: 'max (Агрессивно)' }
    ];

    return (
        <fieldset className="form-section bot-specific-settings">
            <legend>Настройки сеточного бота</legend>

            <div className="form-group">
                <label>
                    <InfoTooltip text="Объем исторических данных
                    (1000 закрытых свечей) для рассчета границ сетки. Например, при 1-минутном таймфрейме
                    свечей (1m) длина истории составит 1000 минут (16.6 часов)" children="Длина истории - 1000 свечей (Фиксированная)"/>
                </label>
            </div>

            <div className="form-group">
                <label>
                    <InfoTooltip text="Временной интервал,
                    за который формируется одна японская свеча на графике. На 1m (1 минута)
                    бот реагирует на мелкие колебания (скальпинг), на 5m (5 минут) — на более
                    устойчивые локальные тренды. Чем меньше таймфрейм, тем чаще обновляется сетка."
                                 children="Таймфрейм свечей"/>
                </label>
                <select {...register('spotGridSettingsData.candleLength')}>
                    <option value="1">1m</option>
                    <option value="5">5m</option>
                </select>
            </div>

            <div className="form-group">
                <label>
                    <InfoTooltip text="Торговая пара к USDT. Бот будет покупать выбранный актив
                    при падении к уровням сетки и продавать при отскоке. Убедитесь, что на
                    балансе биржи достаточно USDT." children="Криптовалюта"/>
                </label>
                <select {...register('spotGridSettingsData.crypto')}>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                </select>
            </div>

            <div className="form-group full-width">
                <label>
                    <InfoTooltip text="Динамический диапазон торговли (ценовые границы бота). min/max — это абсолютные исторические
                        минимумы/максимумы.
                        Q1/Q3 (квантили) — более узкий ценовой диапазон, который отсекает резкие аномальные
                        прострелы и тени свечей." children="Размер сетки"/>
                </label>
                <div className="radio-group vertical nested">
                    <div className="sub-group grid-bounds">
                        <div>
                            <p>Нижняя граница:</p>
                            {lowerBoundOptions.map(opt => (
                                <label key={opt.value}>
                                    <input type="radio" value={opt.value}
                                           {...register('spotGridSettingsData.gridSettings.lowerBoundDynamic')} />
                                    {opt.label}
                                </label>
                            ))}
                        </div>

                        <div>
                            <p>Верхняя граница:</p>
                            {upperBoundOptions.map(opt => (
                                <label key={opt.value}>
                                    <input type="radio" value={opt.value}
                                           {...register('spotGridSettingsData.gridSettings.upperBoundDynamic')} />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-group full-width">
                <label>
                    <InfoTooltip text="Количество уровней – количество уровней внутри сетки.
                    Цена за ставку – сумма в USDT, на которую бот будет открывать каждый ордер
                    (заказ на покупку/продажу). Больше уровней — чаще сделки, но меньше профит
                    с каждого шага." children="Количество уровней внутри сетки и цена за ставку"/>
                </label>
                <div className="radio-group vertical nested">
                    <div className="sub-group levels">
                        <div className="input-with-unit">
                            <input
                                type="number"
                                step="any"
                                {...register('spotGridSettingsData.levelsSettings.countStatic')}
                            />
                            <span className="unit-text">уровней</span>
                            {fieldErrors?.countStatic && <span className="error-text short">{fieldErrors.countStatic.message}</span>}
                        </div>
                        <div className="input-with-unit">
                            <input
                                type="number"
                                step="any"
                                {...register('spotGridSettingsData.levelsSettings.pricePerBetStatic')}
                            />
                            <span className="unit-text">$ ставка</span>
                            {fieldErrors?.pricePerBetStatic && <span className="error-text short">{fieldErrors.pricePerBetStatic.message}</span>}
                        </div>
                        <p className="form-hint">Цена за ставку должна быть ≤ {(deposit / staticLevelsCount).toFixed(2)}$</p>
                    </div>
                </div>
            </div>

            <div className="form-group full-width">
                <label>
                    <InfoTooltip text="Защитная функция. Если цена упадет ниже или
                    взлетит выше границ вашей сетки, бот мгновенно продаст актив по рыночной цене."
                                 children="Стоп-лосс (Всегда активен)"/>
                </label>
            </div>

            <div className="form-group full-width">
                <label>
                    <InfoTooltip text={"Каждые \""+candleLength+"\" минут бот пересчитывает границы " +
                        "сетки под текущий рынок, чтобы сетка могла динамически \"плыть\" за ценой"}
                                 children={"Обновление сетки (Интервал: каждые "+candleLength+"m)"}/>
                </label>
            </div>
        </fieldset>
    );
}
