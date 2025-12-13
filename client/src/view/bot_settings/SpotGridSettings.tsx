import React, { useEffect } from 'react';
import { Control, UseFormSetValue, UseFormWatch, useController } from 'react-hook-form';
import './SpotGridSettings.css';
import {CreateBot} from "../../api/Types";

type ControlType = Control<CreateBot>;
type WatchType = UseFormWatch<CreateBot>;
type SetValueType = UseFormSetValue<CreateBot>;

interface SpotGridSettingsProps {
    control: ControlType;
    watch: WatchType;
    setValue: SetValueType;
    deposit: number;
}

export function SpotGridSettings({ control, watch, setValue, deposit }: SpotGridSettingsProps) {
    const { field: historyLengthField } = useController({ name: 'spot_grid_settings_data.history_length', control });
    const { field: candleLengthField } = useController({ name: 'spot_grid_settings_data.candle_length', control });
    const { field: cryptoField } = useController({ name: 'spot_grid_settings_data.crypto', control });
    const { field: gridSizeTypeField } = useController({ name: 'spot_grid_settings_data.grid_settings.type', control });
    const { field: staticGridLowerField } = useController({ name: 'spot_grid_settings_data.grid_settings.lower_bound_static', control });
    const { field: staticGridUpperField } = useController({ name: 'spot_grid_settings_data.grid_settings.upper_bound_static', control });
    const { field: autoGridLowerField } = useController({ name: 'spot_grid_settings_data.grid_settings.lower_bound_dynamic', control });
    const { field: autoGridUpperField } = useController({ name: 'spot_grid_settings_data.grid_settings.upper_bound_dynamic', control });
    const { field: levelCountTypeField } = useController({ name: 'spot_grid_settings_data.levels_settings.type', control });
    const { field: staticLevelsCountField } = useController({ name: 'spot_grid_settings_data.levels_settings.count_static', control });
    const { field: staticLevelsPriceField } = useController({ name: 'spot_grid_settings_data.levels_settings.price_per_bet_static', control });
    const { field: dynamicLevelsProfitField } = useController({ name: 'spot_grid_settings_data.levels_settings.profit_dynamic', control });
    const { field: stopLossTypeField } = useController({ name: 'spot_grid_settings_data.stop_loss_type', control });
    const { field: updateGridIntervalTypeField } = useController({ name: 'spot_grid_settings_data.update_grid_interval_type', control });
    const { field: updateGridIntervalTimeField } = useController({ name: 'spot_grid_settings_data.update_grid_interval_time', control });

    const gridSizeType = watch('spot_grid_settings_data.grid_settings.type');
    const levelCountType = watch('spot_grid_settings_data.levels_settings.type');
    const updateGridIntervalType = watch('spot_grid_settings_data.update_grid_interval_type');
    const staticLevelsCount = watch('spot_grid_settings_data.levels_settings.count_static') || 1;

    useEffect(() => {
        if (gridSizeType === 'static') {
            setValue('spot_grid_settings_data.grid_settings.lower_bound_dynamic', undefined);
            setValue('spot_grid_settings_data.grid_settings.upper_bound_dynamic', undefined);
        } else if (gridSizeType === 'auto') {
            setValue('spot_grid_settings_data.grid_settings.lower_bound_static', undefined);
            setValue('spot_grid_settings_data.grid_settings.upper_bound_static', undefined);
        }
    }, [gridSizeType, setValue]);

    useEffect(() => {
        if (levelCountType === 'static') {
            setValue('spot_grid_settings_data.levels_settings.profit_dynamic', undefined);
        } else if (levelCountType === 'dynamic') {
            setValue('spot_grid_settings_data.levels_settings.count_static', undefined);
            setValue('spot_grid_settings_data.levels_settings.price_per_bet_static', undefined);
        }
    }, [levelCountType, setValue]);

    return (
        <fieldset className="form-section bot-specific-settings">
            <legend>Настройки Spot Grid Bot</legend>

            <div className="form-group"><label>Длина истории (кол-во свечей, максимум - 1000)</label><input type="number" {...historyLengthField} /></div>
            <div className="form-group"><label>Длина свечей</label><select {...candleLengthField}><option value="1m">1м</option><option value="5m">5м</option><option value="15m">15м</option></select></div>
            <div className="form-group"><label>Криптовалюта</label><select {...cryptoField}><option value="MNT">MNT</option><option value="BTC">BTC</option><option value="ETH">ETH</option></select></div>

            <div className="form-group full-width"><label>Размер сетки</label>
                <div className="radio-group vertical nested">
                    <label><input type="radio" {...gridSizeTypeField} value="static" checked={gridSizeType === 'static'}/> Статическая</label>
                    {gridSizeType === 'static' && <div className="sub-group"><input type="number" placeholder="Нижняя граница" {...staticGridLowerField}/><input type="number" placeholder="Верхняя граница" {...staticGridUpperField}/></div>}

                    <label><input type="radio" {...gridSizeTypeField} value="auto" checked={gridSizeType === 'auto'}/> Динамическая (автоподбор по истории: {historyLengthField.value} свечей по {candleLengthField.value})</label>
                    {gridSizeType === 'auto' && (
                        <div className="sub-group grid-bounds">
                            <div>
                                <p>Нижняя:</p>
                                <label><input type="radio" {...autoGridLowerField} value="min" checked={autoGridLowerField.value === 'min'} /> min</label>
                                <label><input type="radio" {...autoGridLowerField} value="10%" checked={autoGridLowerField.value === '10%'} /> 10%</label>
                                <label><input type="radio" {...autoGridLowerField} value="q1" checked={autoGridLowerField.value === 'q1'} /> Q1</label>
                            </div>
                            <div>
                                <p>Верхняя:</p>
                                <label><input type="radio" {...autoGridUpperField} value="q3" checked={autoGridUpperField.value === 'q3'} /> Q3</label>
                                <label><input type="radio" {...autoGridUpperField} value="90%" checked={autoGridUpperField.value === '90%'} /> 90%</label>
                                <label><input type="radio" {...autoGridUpperField} value="max" checked={autoGridUpperField.value === 'max'} /> max</label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="form-group full-width"><label>Кол-во уровней и цена за ставку</label>
                <div className="radio-group vertical nested">
                    <label><input type="radio" {...levelCountTypeField} value="static" checked={levelCountType === 'static'} /> Статическое</label>
                    {levelCountType === 'static' && <div className="sub-group"><input type="number" placeholder="Кол-во уровней (5, 10...)" {...staticLevelsCountField} /><input type="number" placeholder="Цена за ставку ($)" {...staticLevelsPriceField} /><p className="form-hint">Цена за ставку ≤ {(deposit / staticLevelsCount).toFixed(2)}$</p></div>}

                    <label><input type="radio" {...levelCountTypeField} value="dynamic" checked={levelCountType === 'dynamic'} /> Динамическое (подбор по профиту)</label>
                    {levelCountType === 'dynamic' && <div className="sub-group"><input type="number" placeholder="Профит на уровень ($)" step="0.1" {...dynamicLevelsProfitField} /></div>}
                </div>
            </div>

            <div className="form-group full-width"><label>Стоп-лосс</label>
                <div className="radio-group vertical nested">
                    <label>
                        <input type="radio" {...stopLossTypeField} value="hard" checked={stopLossTypeField.value === 'hard'}/>
                        Жесткий <span className="radio-description">(при выходе ставки за пределы сетки — мгновенная продажа)</span>
                    </label>
                    <label>
                        <input type="radio" {...stopLossTypeField} value="soft" checked={stopLossTypeField.value === 'soft'}/>
                        Мягкий <span className="radio-description">(Если ставка вышла за пределы сетки — смещает ее к границам сетки)</span>
                    </label>
                </div>
            </div>

            {gridSizeType === 'auto' && (
                <div className="form-group full-width"><label>Обновлять сетку раз в...</label>
                    <div className="radio-group vertical nested">
                        <label><input type="radio" {...updateGridIntervalTypeField} value="byTime" checked={updateGridIntervalType === 'byTime'}/> N минут</label>
                        {updateGridIntervalType === 'byTime' && <div className="sub-group"><input type="number" placeholder="Кол-во минут" {...updateGridIntervalTimeField} /></div>}
                        <label><input type="radio" {...updateGridIntervalTypeField} value="byCandle" checked={updateGridIntervalType === 'byCandle'}/> Исходя из длины свечи ({candleLengthField.value})</label>
                    </div>
                </div>
            )}
        </fieldset>
    );
}