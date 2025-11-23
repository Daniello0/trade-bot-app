import React, { useEffect } from 'react';
import { Control, useController, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { BotConfig } from '../../schema/BotSettings';
import './FullSpotSettings.css';

type ControlType = Control<BotConfig>;
type WatchType = UseFormWatch<BotConfig>;
type SetValueType = UseFormSetValue<BotConfig>;

interface FullSpotSettingsProps {
    control: ControlType;
    watch: WatchType;
    setValue: SetValueType;
}

const mockCryptos = [{id: 'BTC', name: 'BTC'}, {id: 'ETH', name: 'ETH'},
    {id: 'MNT', name: 'MNT'}, {id: 'SOL', name: 'SOL'}, {id: 'XRP', name: 'XRP'},
    {id: 'ADA', name: 'ADA'}, {id: 'DOGE', name: 'DOGE'}, {id: 'AVAX', name: 'AVAX'}];
const availableIndicators = ['RSI', 'ADX', 'Анализ свечей'];

export function FullSpotSettings({ control, watch, setValue }: FullSpotSettingsProps) {
    const { field: ignoreListField } = useController({ name: 'settings.ignoreList', control });
    const { field: maxActiveCryptosField } = useController({ name: 'settings.maxActiveCryptos', control });
    const { field: pricePerBetField } = useController({ name: 'settings.pricePerBet', control });
    const { field: cryptoListTypeField } = useController({ name: 'settings.cryptoListType', control });
    const { field: manualCryptoListField } = useController({ name: 'settings.manualCryptoList', control, defaultValue: [] });
    const { field: indicatorsField } = useController({ name: 'settings.indicators', control, defaultValue: [] });
    const { field: profitPerCryptoField } = useController({ name: 'settings.profitPerCrypto', control });
    const { field: stopLossTypeField } = useController({ name: 'settings.stopLossType', control });
    const { field: stopLossIntervalValueField } = useController({ name: 'settings.stopLossIntervalValue', control });
    const { field: stopLossTimeValueField } = useController({ name: 'settings.stopLossTimeValue', control });

    const cryptoListType = watch('settings.cryptoListType');
    const stopLossType = watch('settings.stopLossType');

    useEffect(() => {
        if (cryptoListType === 'auto') {
            setValue('settings.manualCryptoList', undefined);
        }
    }, [cryptoListType, setValue]);

    useEffect(() => {
        const isInterval = stopLossType === 'interval' || stopLossType === 'interval_and_time';
        const isTime = stopLossType === 'time' || stopLossType === 'interval_and_time';

        if (!isInterval) setValue('settings.stopLossIntervalValue', undefined);
        if (!isTime) setValue('settings.stopLossTimeValue', undefined);
    }, [stopLossType, setValue]);

    const handleCheckboxListChange = (field: typeof manualCryptoListField | typeof indicatorsField, value: string) => {
        const currentList = Array.isArray(field.value) ? field.value : [];
        const isChecked = currentList.includes(value);
        const newList = isChecked
            ? currentList.filter((item: string) => item !== value)
            : [...currentList, value];
        field.onChange(newList);
    };

    return (
        <fieldset className="form-section bot-specific-settings">
            <legend>Настройки Full Spot Bot</legend>

            <div className="form-group"><label>Игнор-лист (через запятую)</label><input type="text" {...ignoreListField} /></div>
            <div className="form-group"><label>Макс. кол-во купленных криптовалют</label><input type="number" {...maxActiveCryptosField} /></div>
            <div className="form-group"><label>Цена за ставку, $</label><input type="number" {...pricePerBetField} /></div>

            <div className="form-group full-width">
                <label>Список криптовалют</label>
                <div className="radio-group vertical nested">
                    <label><input type="radio" {...cryptoListTypeField} value="auto" checked={cryptoListType === 'auto'}/> Подобрать автоматически</label>
                    <label><input type="radio" {...cryptoListTypeField} value="manual" checked={cryptoListType === 'manual'}/> Записать вручную</label>
                    {cryptoListType === 'manual' && (
                        <div className="sub-group">
                            <div className="checkbox-scroll-list">
                                {mockCryptos.map(crypto => (
                                    <label key={crypto.id} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            value={crypto.id}
                                            checked={(Array.isArray(manualCryptoListField.value) ? manualCryptoListField.value : []).includes(crypto.id)}
                                            onChange={() => handleCheckboxListChange(manualCryptoListField, crypto.id)}
                                        />
                                        {crypto.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="form-group full-width">
                <label>Индикаторы</label>
                <div className="sub-group">
                    <div className="checkbox-scroll-list">
                        {availableIndicators.map(indicator => (
                            <label key={indicator} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    value={indicator}
                                    checked={(Array.isArray(indicatorsField.value) ? indicatorsField.value : []).includes(indicator)}
                                    onChange={() => handleCheckboxListChange(indicatorsField, indicator)}
                                />
                                {indicator}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="form-group"><label>Профит за криптовалюту, %</label><input type="number" step="0.1" {...profitPerCryptoField} /></div>

            <div className="form-group full-width">
                <label>Стоп-лосс</label>
                <div className="radio-group vertical nested">
                    <label><input type="radio" {...stopLossTypeField} value="none" checked={stopLossType === 'none'}/> Нет</label>

                    <label><input type="radio" {...stopLossTypeField} value="interval" checked={stopLossType === 'interval'}/> Интервальный</label>
                    {stopLossType === 'interval' && (
                        <div className="sub-group">
                            <input type="number" {...stopLossIntervalValueField} />
                            <span className="input-adornment">%</span>
                        </div>
                    )}

                    <label><input type="radio" {...stopLossTypeField} value="time" checked={stopLossType === 'time'}/> Временной</label>
                    {stopLossType === 'time' && (
                        <div className="sub-group">
                            <input type="number" {...stopLossTimeValueField} />
                            <span className="input-adornment">минут</span>
                        </div>
                    )}

                    <label><input type="radio" {...stopLossTypeField} value="interval_and_time" checked={stopLossType === 'interval_and_time'}/> Интервальный и Временной</label>
                    {stopLossType === 'interval_and_time' && (
                        <>
                            <div className="sub-group">
                                <input type="number" placeholder="Интервал, %" {...stopLossIntervalValueField} />
                            </div>
                            <div className="sub-group">
                                <input type="number" placeholder="Время, мин." {...stopLossTimeValueField} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </fieldset>
    );
}