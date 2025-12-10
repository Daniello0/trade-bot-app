export interface CreateGridSettings {
    type: string;
    lower_bound_static?: number;
    upper_bound_static?: number;
    lower_bound_dynamic?: string;
    upper_bound_dynamic?: string;
}

export interface CreateLevelsSettings {
    type: string;
    count_static?: number;
    price_per_bet_static?: number;
    profit_dynamic?: number;
}

export interface CreateSpotGridSettings {
    history_length: number;
    candle_length: string;
    crypto: string;
    stop_loss_type: string;
    update_grid_interval_type: string;
    update_grid_interval_time?: number;
    grid_settings: CreateGridSettings;
    levels_settings: CreateLevelsSettings;
}

interface ReadLevelsSettings {
    type: string;
    count_static?: number;
    price_per_bet_static?: number;
    profit_dynamic?: number;
}

interface ReadGridSettings {
    type: string;
    lower_bound_static?: number;
    upper_bound_static?: number;
    lower_bound_dynamic?: string;
    upper_bound_dynamic?: string;
}

interface ReadSpotGridSettings {
    history_length: number;
    candle_length: number;
    crypto: string;
    stop_loss_type: string;
    update_grid_interval_type: string;
    update_grid_interval_time?: number;
    grid_settings: ReadGridSettings;
    levels_settings: ReadLevelsSettings;
}

export interface CreateBot {
    name: string;
    deposit: number;
    bot_type: 'spotGrid' | 'fullSpot';
    spot_grid_settings_data?: CreateSpotGridSettings;
    full_spot_settings_data?: any;
}

export interface ReadBotSummary {
    id: number;
    user_id: string;
    name: string;
    deposit: number;
    bot_type: string;
}

export interface ReadBotDetails {
    id: number;
    user_id: string;
    name: string;
    deposit: number;
    bot_type: string;
    full_spot_settings?: any;
    spot_grid_settings?: ReadSpotGridSettings;
}
