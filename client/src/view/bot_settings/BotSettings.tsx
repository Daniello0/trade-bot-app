import React, { useState } from 'react';
import { useNavigate } from "react-router";
import './BotSettings.css';

interface SpotGridSettings {
    historyLength: number;
    candleLength: string;
    crypto: string;
    gridSizeType: string;
    staticGrid: { lowerBound: number | null, upperBound: number | null };
    autoGrid: { lower: string | null, upper: string | null };
    levelCountType: string;
    staticLevels: { count: number, pricePerBet: number };
    dynamicLevels: { profitPerLevel: number };
    stopLossType: string;
    updateGridIntervalType: string;
    updateGridIntervalTime: number;
}

interface FullSpotSettings {
    ignoreList: string;
    maxActiveCryptos: number;
    pricePerBet: number;
    cryptoListType: string;
    manualCryptoList: string[];
    indicators: string[];
    profitPerCrypto: number;
    stopLossTypes: {
        interval: boolean;
        time: boolean;
    };
    stopLossIntervalValue: number;
    stopLossTimeValue: number;
}

interface BotSettingsState {
    botType: 'spotGrid' | 'fullSpot';
    name: string;
    deposit: number;
    spotGrid: SpotGridSettings;
    fullSpot: FullSpotSettings;
}


function BotSettings() {
    const navigate = useNavigate();

    const mockCryptos = [{id: 'BTC', name: 'BTC'}, {id: 'ETH', name: 'ETH'},
        {id: 'MNT', name: 'MNT'}, {id: 'SOL', name: 'SOL'}, {id: 'XRP', name: 'XRP'},
        {id: 'ADA', name: 'ADA'}, {id: 'DOGE', name: 'DOGE'}, {id: 'AVAX', name: 'AVAX'}];

    const availableIndicators = ['RSI', 'ADX', 'Анализ свечей'];

    const [settings, setSettings] = useState<BotSettingsState>({
        botType: 'spotGrid',
        name: '',
        deposit: NaN,
        spotGrid: {
            historyLength: NaN,
            candleLength: '5m',
            crypto: 'MNT',
            gridSizeType: 'static',
            staticGrid: { lowerBound: null, upperBound: null },
            autoGrid: { lower: null, upper: null },
            levelCountType: 'static',
            staticLevels: { count: NaN, pricePerBet: NaN },
            dynamicLevels: { profitPerLevel: 0.2 },
            stopLossType: 'hard',
            updateGridIntervalType: 'byCandle',
            updateGridIntervalTime: 15,
        },
        fullSpot: {
            ignoreList: 'USDC, USDT',
            maxActiveCryptos: 10,
            pricePerBet: 100,
            cryptoListType: 'auto',
            manualCryptoList: [],
            indicators: [],
            profitPerCrypto: 1.5,
            stopLossTypes: {
                interval: true,
                time: false,
            },
            stopLossIntervalValue: 5,
            stopLossTimeValue: 60
        }
    });

    const handleChange = (section: keyof Pick<BotSettingsState, 'spotGrid' | 'fullSpot'>, field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSubFieldChange = (section: keyof Pick<BotSettingsState, 'spotGrid' | 'fullSpot'>, subField: string, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subField]: {
                    ...(prev[section] as any)[subField],
                    [key]: value
                }
            }
        }));
    };

    const handleGeneralChange = (field: keyof Omit<BotSettingsState, 'spotGrid' | 'fullSpot'>, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxListChange = (field: 'manualCryptoList' | 'indicators', value: string) => {
        setSettings(prev => {
            const list = prev.fullSpot[field];
            const isChecked = list.includes(value);
            const newList = isChecked
                ? list.filter(item => item !== value)
                : [...list, value];

            return {
                ...prev,
                fullSpot: {
                    ...prev.fullSpot,
                    [field]: newList
                }
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Сохраненные настройки бота:", settings);
        alert("Настройки сохранены! (см. консоль)");
        navigate("/");
    };

    return (
        <div className="bot-settings-page">
            <form className="bot-settings-form" onSubmit={handleSubmit}>
                <h1>Настройки ботов</h1>

                <fieldset className="form-section">
                    <legend>Общие</legend>
                    <div className="form-group">
                        <label htmlFor="name">Имя</label>
                        <input type="text" id="name" value={settings.name} onChange={(e) => handleGeneralChange('name', e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="deposit">Депозит, $</label>
                        <input type="number" id="deposit" value={isNaN(settings.deposit) ? '' : settings.deposit} onChange={(e) => handleGeneralChange('deposit', parseFloat(e.target.value))} min="0" required />
                    </div>
                    <div className="form-group info">
                        <label>Комиссия</label>
                        <p>0.1% на покупку, 0.1% на продажу</p>
                    </div>
                </fieldset>

                <fieldset className="form-section">
                    <legend>Тип бота</legend>
                    <div className="radio-group horizontal">
                        <label><input type="radio" name="botType" value="spotGrid" checked={settings.botType === 'spotGrid'} onChange={(e) => handleGeneralChange('botType', e.target.value)} /> Spot Grid Bot</label>
                        <label><input type="radio" name="botType" value="fullSpot" checked={settings.botType === 'fullSpot'} onChange={(e) => handleGeneralChange('botType', e.target.value)} /> Full Spot Bot</label>
                    </div>
                </fieldset>


                {settings.botType === 'spotGrid' && (
                    <fieldset className="form-section bot-specific-settings">
                        <legend>Настройки Spot Grid Bot</legend>
                        <div className="form-group"><label>Длина истории (кол-во свечей, максимум - 1000)</label><input type="number" value={settings.spotGrid.historyLength} onChange={e => handleChange('spotGrid', 'historyLength', parseInt(e.target.value))} /></div>
                        <div className="form-group"><label>Длина свечей</label><select value={settings.spotGrid.candleLength} onChange={e => handleChange('spotGrid', 'candleLength', e.target.value)}><option value="1m">1м</option><option value="5m">5м</option><option value="15m">15м</option></select></div>
                        <div className="form-group"><label>Криптовалюта</label><select value={settings.spotGrid.crypto} onChange={e => handleChange('spotGrid', 'crypto', e.target.value)}><option value="MNT">MNT</option><option value="BTC">BTC</option><option value="ETH">ETH</option></select></div>

                        <div className="form-group full-width"><label>Размер сетки</label>
                            <div className="radio-group vertical nested">
                                <label><input type="radio" name="gridSizeType" value="static" checked={settings.spotGrid.gridSizeType === 'static'} onChange={e => handleChange('spotGrid', 'gridSizeType', e.target.value)} /> Статическая</label>
                                {settings.spotGrid.gridSizeType === 'static' && <div className="sub-group"><input type="number" placeholder="Нижняя граница" /><input type="number" placeholder="Верхняя граница" /></div>}
                                <label><input type="radio" name="gridSizeType" value="auto" checked={settings.spotGrid.gridSizeType === 'auto'} onChange={e => handleChange('spotGrid', 'gridSizeType', e.target.value)} /> Автоподбор по истории</label>
                                {settings.spotGrid.gridSizeType === 'auto' && <div className="sub-group grid-bounds"><div><p>Нижняя:</p><label><input type="radio" name="autoLower" /> min</label><label><input type="radio" name="autoLower" /> 10%</label><label><input type="radio" name="autoLower" /> Q1</label></div><div><p>Верхняя:</p><label><input type="radio" name="autoUpper" /> Q3</label><label><input type="radio" name="autoUpper" /> 90%</label><label><input type="radio" name="autoUpper" /> max</label></div></div>}
                            </div>
                        </div>
                        <div className="form-group full-width">
                            <label>Кол-во уровней и цена за ставку</label>
                            <div className="radio-group vertical nested">
                                <label><input type="radio" name="levelCountType" value="static" checked={settings.spotGrid.levelCountType === 'static'} onChange={e => handleChange('spotGrid', 'levelCountType', e.target.value)} /> Статическое</label>
                                {settings.spotGrid.levelCountType === 'static' &&
                                    <div className="sub-group">
                                        <input type="number" placeholder="Кол-во уровней (5, 10...)" value={settings.spotGrid.staticLevels.count} onChange={e => handleSubFieldChange('spotGrid', 'staticLevels', 'count', parseInt(e.target.value))} />
                                        <input type="number" placeholder="Цена за ставку ($)" value={settings.spotGrid.staticLevels.pricePerBet} onChange={e => handleSubFieldChange('spotGrid', 'staticLevels', 'pricePerBet', parseFloat(e.target.value))} />
                                        <p className="form-hint">Цена за ставку ≤ {(settings.deposit / (settings.spotGrid.staticLevels.count || 1)).toFixed(2)}$</p>
                                    </div>
                                }
                                <label><input type="radio" name="levelCountType" value="dynamic" checked={settings.spotGrid.levelCountType === 'dynamic'} onChange={e => handleChange('spotGrid', 'levelCountType', e.target.value)} /> Динамическое (минимальный профит)</label>
                                {settings.spotGrid.levelCountType === 'dynamic' &&
                                    <div className="sub-group">
                                        <input type="number" placeholder="Профит на уровень (%)" step="0.1" value={settings.spotGrid.dynamicLevels.profitPerLevel} onChange={e => handleSubFieldChange('spotGrid', 'dynamicLevels', 'profitPerLevel', parseFloat(e.target.value))} />
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="form-group full-width">
                            <label>Стоп-лосс</label>
                            <div className="radio-group vertical nested">
                                <label>
                                    <input type="radio" name="stopLossType" value="hard" checked={settings.spotGrid.stopLossType === 'hard'} onChange={e => handleChange('spotGrid', 'stopLossType', e.target.value)} />
                                    Жесткий <span className="radio-description">(при выходе ставки за пределы сетки — мгновенная продажа)</span>
                                </label>
                                <label>
                                    <input type="radio" name="stopLossType" value="soft" checked={settings.spotGrid.stopLossType === 'soft'} onChange={e => handleChange('spotGrid', 'stopLossType', e.target.value)} />
                                    Мягкий <span className="radio-description">(Если ставка вышла за пределы сетки — смещает ее к границам сетки)</span>
                                </label>
                            </div>
                        </div>
                        {settings.spotGrid.gridSizeType === 'auto' && (
                            <div className="form-group full-width">
                                <label>Обновлять сетку раз в...</label>
                                <div className="radio-group vertical nested">
                                    <label>
                                        <input type="radio" name="updateGridIntervalType" value="byTime" checked={settings.spotGrid.updateGridIntervalType === 'byTime'} onChange={e => handleChange('spotGrid', 'updateGridIntervalType', e.target.value)} />
                                        N минут
                                    </label>
                                    {settings.spotGrid.updateGridIntervalType === 'byTime' &&
                                        <div className="sub-group">
                                            <input type="number" placeholder="Кол-во минут" value={settings.spotGrid.updateGridIntervalTime} onChange={e => handleChange('spotGrid', 'updateGridIntervalTime', parseInt(e.target.value))} />
                                        </div>
                                    }
                                    <label>
                                        <input type="radio" name="updateGridIntervalType" value="byCandle" checked={settings.spotGrid.updateGridIntervalType === 'byCandle'} onChange={e => handleChange('spotGrid', 'updateGridIntervalType', e.target.value)} />
                                        Исходя из длины свечи ({settings.spotGrid.candleLength})
                                    </label>
                                </div>
                            </div>
                        )}
                    </fieldset>
                )}

                {settings.botType === 'fullSpot' && (
                    <fieldset className="form-section bot-specific-settings">
                        <legend>Настройки Full Spot Bot</legend>
                        <div className="form-group"><label>Игнор-лист (через запятую)</label><input type="text" value={settings.fullSpot.ignoreList} onChange={e => handleChange('fullSpot', 'ignoreList', e.target.value)} /></div>
                        <div className="form-group"><label>Макс. кол-во купленных криптовалют</label><input type="number" value={settings.fullSpot.maxActiveCryptos} onChange={e => handleChange('fullSpot', 'maxActiveCryptos', parseInt(e.target.value))} /></div>
                        <div className="form-group"><label>Цена за ставку, $</label><input type="number" value={settings.fullSpot.pricePerBet} onChange={e => handleChange('fullSpot', 'pricePerBet', parseFloat(e.target.value))} /></div>

                        <div className="form-group full-width">
                            <label>Список криптовалют</label>
                            <div className="radio-group vertical nested">
                                <label><input type="radio" name="cryptoListType" value="auto" checked={settings.fullSpot.cryptoListType === 'auto'} onChange={e => handleChange('fullSpot', 'cryptoListType', e.target.value)} /> Подобрать автоматически</label>
                                <label><input type="radio" name="cryptoListType" value="manual" checked={settings.fullSpot.cryptoListType === 'manual'} onChange={e => handleChange('fullSpot', 'cryptoListType', e.target.value)} /> Записать вручную</label>
                                {settings.fullSpot.cryptoListType === 'manual' && (
                                    <div className="sub-group">
                                        <div className="checkbox-scroll-list">
                                            {mockCryptos.map(crypto => (
                                                <label key={crypto.id} className="checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        value={crypto.id}
                                                        checked={settings.fullSpot.manualCryptoList.includes(crypto.id)}
                                                        onChange={() => handleCheckboxListChange('manualCryptoList', crypto.id)}
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
                                                checked={settings.fullSpot.indicators.includes(indicator)}
                                                onChange={() => handleCheckboxListChange('indicators', indicator)}
                                            />
                                            {indicator}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Профит за криптовалюту, %</label>
                            <input type="number" step="0.1" value={settings.fullSpot.profitPerCrypto} onChange={e => handleChange('fullSpot', 'profitPerCrypto', parseFloat(e.target.value))} />
                        </div>

                        <div className="form-group full-width">
                            <label>Стоп-лосс</label>
                            <div className="checkbox-group vertical nested">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={settings.fullSpot.stopLossTypes.interval}
                                        onChange={e => handleSubFieldChange('fullSpot', 'stopLossTypes', 'interval', e.target.checked)}
                                    />
                                    Интервальный
                                </label>
                                {settings.fullSpot.stopLossTypes.interval && (
                                    <div className="sub-group">
                                        <input type="number" value={settings.fullSpot.stopLossIntervalValue} onChange={e => handleChange('fullSpot', 'stopLossIntervalValue', parseInt(e.target.value, 10))}/>
                                        <span className="input-adornment">% (продавать, если цена упала на {settings.fullSpot.stopLossIntervalValue}%)</span>
                                    </div>
                                )}
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={settings.fullSpot.stopLossTypes.time}
                                        onChange={e => handleSubFieldChange('fullSpot', 'stopLossTypes', 'time', e.target.checked)}
                                    />
                                    Временной
                                </label>
                                {settings.fullSpot.stopLossTypes.time && (
                                    <div className="sub-group">
                                        <input type="number" value={settings.fullSpot.stopLossTimeValue} onChange={e => handleChange('fullSpot', 'stopLossTimeValue', parseInt(e.target.value, 10))}/>
                                        <span className="input-adornment">минут (продавать, если не продана через {settings.fullSpot.stopLossTimeValue} минут)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </fieldset>
                )}

                <div className="form-actions">
                    <button type="button" className="action-button secondary" onClick={() => navigate(-1)}>Назад</button>
                    <button type="submit" className="add-bot-button">Сохранить</button>
                </div>
            </form>
        </div>
    );
}

export default BotSettings;