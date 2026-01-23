import React from 'react';
import { Control, UseFormSetValue, UseFormWatch, useController } from 'react-hook-form';
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
}

export function SpotGridSettings({ control, watch, deposit }: SpotGridSettingsProps) {
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
                    <option value="1m">1м</option>
                    <option value="5m">5м</option>
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
                                <label><input type="radio" {...autoGridLowerField} value="10%" checked={autoGridLowerField.value === '10%'} /> 10%</label>
                                <label><input type="radio" {...autoGridLowerField} value="q1" checked={autoGridLowerField.value === 'q1'} /> Q1</label>
                            </div>

                            <div>
                                <p>Верхняя граница:</p>
                                <label><input type="radio" {...autoGridUpperField} value="q3" checked={autoGridUpperField.value === 'q3'} /> Q3</label>
                                <label><input type="radio" {...autoGridUpperField} value="90%" checked={autoGridUpperField.value === '90%'} /> 90%</label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="form-group full-width">
                <label>Кол-во уровней и цена за ставку</label>
                <div className="radio-group vertical nested">
                    {(
                        <div className="sub-group">
                            <input type="number" placeholder="Кол-во уровней (5, 10...)" {...staticLevelsCountField} />
                            <input type="number" placeholder="Цена за ставку ($)" {...staticLevelsPriceField} />
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
                    <label>Обновление сетки исходя из длины свечи ({candleLengthField.value})</label>
                </div>
            )}
        </fieldset>
    );
}
