import React from 'react';
import {Control, UseFormSetValue, UseFormWatch, useController, FieldErrors} from 'react-hook-form';
import './SpotGridSettings.css';
import { CreateBot } from "../../api/Types";

type ControlType = Control<CreateBot>;
type WatchType = UseFormWatch<CreateBot>;
type SetValueType = UseFormSetValue<CreateBot>;

interface SpotGridSettingsProps {
    control: ControlType;
    watch: WatchType;
    setValue: SetValueType;
    deposit: number;
    errors: FieldErrors<CreateBot>;
}

export function SpotGridSettings({ control, watch, deposit, errors }: SpotGridSettingsProps) {
    const { field: candleLengthField } = useController({ name: 'spotGridSettingsData.candleLength', control });
    const { field: cryptoField } = useController({ name: 'spotGridSettingsData.crypto', control });

    const { field: autoGridLowerField } = useController({ name: 'spotGridSettingsData.gridSettings.lowerBoundDynamic', control });
    const { field: autoGridUpperField } = useController({ name: 'spotGridSettingsData.gridSettings.upperBoundDynamic', control });

    const { field: staticLevelsCountField } = useController({ name: 'spotGridSettingsData.levelsSettings.countStatic', control });
    const { field: staticLevelsPriceField } = useController({ name: 'spotGridSettingsData.levelsSettings.pricePerBetStatic', control });
    const staticLevelsCount = watch('spotGridSettingsData.levelsSettings.countStatic') || 1;

    return (
        <fieldset className="form-section bot-specific-settings">
            <legend>Настройки Spot Grid Bot</legend>

            <div className="form-group">
                <label>Длина истории - 1000 свечей</label>
            </div>

            <div className="form-group">
                <label>Длина свечей</label>
                <select {...candleLengthField}>
                    <option value="1">1m</option>
                    <option value="5">5m</option>
                </select>
            </div>

            <div className="form-group">
                <label>Криптовалюта</label>
                <select {...cryptoField}>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                </select>
            </div>

            <div className="form-group full-width">
                <label>Размер сетки</label>
                <div className="radio-group vertical nested">
                    {(
                        <div className="sub-group grid-bounds">
                            <div>
                                <p>Нижняя граница:</p>
                                <label><input type="radio" {...autoGridLowerField} value="min" checked={autoGridLowerField.value === 'min'} /> min</label>
                                <label><input type="radio" {...autoGridLowerField} value="10%" checked={autoGridLowerField.value === '10%'} /> 10%</label>
                                <label><input type="radio" {...autoGridLowerField} value="q1" checked={autoGridLowerField.value === 'q1'} /> Q1</label>
                            </div>

                            <div>
                                <p>Верхняя граница:</p>
                                <label><input type="radio" {...autoGridUpperField} value="q3" checked={autoGridUpperField.value === 'q3'} /> Q3</label>
                                <label><input type="radio" {...autoGridUpperField} value="90%" checked={autoGridUpperField.value === '90%'} /> 90%</label>
                                <label><input type="radio" {...autoGridUpperField} value="max" checked={autoGridUpperField.value === 'max'} /> max</label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="form-group full-width">
                <label>Кол-во уровней и цена за ставку</label>
                <div className="radio-group vertical nested">
                    {(
                        <div className="sub-group levels">
                            <div className="form-group">
                                <input type="number" placeholder="Кол-во уровней (5, 10...)" {...staticLevelsCountField} />
                                {errors.spotGridSettingsData?.levelsSettings?.countStatic &&
                                    <span className="error-text short">{errors.spotGridSettingsData.levelsSettings.countStatic.message}</span>}
                            </div>
                            <div className="form-group">
                                <input type="number" placeholder="Цена за ставку ($)" {...staticLevelsPriceField} />
                                {errors.spotGridSettingsData?.levelsSettings?.pricePerBetStatic &&
                                    <span className="error-text short">{errors.spotGridSettingsData.levelsSettings.pricePerBetStatic.message}</span>}
                            </div>
                            <p className="form-hint">Цена за ставку ≤ {(deposit / staticLevelsCount).toFixed(2)}$</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="form-group full-width">
                <label>Стоп-лосс - при выходе ставки за пределы сетки — мгновенная продажа</label>
            </div>

            {(
                <div className="form-group full-width">
                    <label>Обновление сетки исходя из длины свечи ({candleLengthField.value}m)</label>
                </div>
            )}
        </fieldset>
    );
}
