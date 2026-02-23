import React from 'react';
import {useFormContext} from 'react-hook-form';
import './SpotGridSettings.css';
import { CreateBot } from "../../api/Types";

export function SpotGridSettings() {
    const { register, watch, formState: { errors } } = useFormContext<CreateBot>();

    const deposit: number = watch('deposit') || 0;
    const candleLength: string | undefined = watch('spotGridSettingsData.candleLength');
    const staticLevelsCount: number = watch('spotGridSettingsData.levelsSettings.countStatic') || 1;

    const fieldErrors = errors.spotGridSettingsData?.levelsSettings;

    return (
        <fieldset className="form-section bot-specific-settings">
            <legend>Настройки Spot Grid Bot</legend>

            <div className="form-group">
                <label>Длина истории - 1000 свечей</label>
            </div>

            <div className="form-group">
                <label>Длина свечей</label>
                <select {...register('spotGridSettingsData.candleLength')}>
                    <option value="1">1m</option>
                    <option value="5">5m</option>
                </select>
            </div>

            <div className="form-group">
                <label>Криптовалюта</label>
                <select {...register('spotGridSettingsData.crypto')}>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                </select>
            </div>

            <div className="form-group full-width">
                <label>Размер сетки</label>
                <div className="radio-group vertical nested">
                    <div className="sub-group grid-bounds">
                        <div>
                            <p>Нижняя граница:</p>
                            {['min', '10%', 'q1'].map(val => (
                                <label key={val}>
                                    <input type="radio" value={val} {...register('spotGridSettingsData.gridSettings.lowerBoundDynamic')} /> {val}
                                </label>
                            ))}
                        </div>

                        <div>
                            <p>Верхняя граница:</p>
                            {['q3', '90%', 'max'].map(val => (
                                <label key={val}>
                                    <input type="radio" value={val} {...register('spotGridSettingsData.gridSettings.upperBoundDynamic')} /> {val}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-group full-width">
                <label>Кол-во уровней и цена за ставку</label>
                <div className="radio-group vertical nested">
                    <div className="sub-group levels">
                        <div className="form-group">
                            <input
                                type="number"
                                step="any"
                                placeholder="Кол-во уровней"
                                {...register('spotGridSettingsData.levelsSettings.countStatic')}
                            />
                            {fieldErrors?.countStatic && <span className="error-text short">{fieldErrors.countStatic.message}</span>}
                        </div>
                        <div className="form-group">
                            <input
                                type="number"
                                step="any"
                                placeholder="Цена за ставку ($)"
                                {...register('spotGridSettingsData.levelsSettings.pricePerBetStatic')}
                            />
                            {fieldErrors?.pricePerBetStatic && <span className="error-text short">{fieldErrors.pricePerBetStatic.message}</span>}
                        </div>
                        <p className="form-hint">Цена за ставку ≤ {(deposit / staticLevelsCount).toFixed(2)}$</p>
                    </div>
                </div>
            </div>

            <div className="form-group full-width">
                <label>Стоп-лосс - при выходе за пределы — продажа</label>
            </div>

            <div className="form-group full-width">
                <label>Обновление сетки исходя из свечи ({candleLength}m)</label>
            </div>
        </fieldset>
    );
}
