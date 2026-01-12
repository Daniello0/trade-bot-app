import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { GridSettings } from './GridSettings';
import { LevelsSettings } from './LevelsSettings';
import { Bots } from './Bots';

@Entity('spot_grid_settings')
export class SpotGridSettings {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column('integer', { nullable: false, name: 'history_length' })
    historyLength: number;

    @Column('text', { nullable: false, name: 'candle_length' })
    candleLength: string;

    @Column('text', { nullable: false })
    crypto: string;

    @Column('text', { nullable: false, name: 'stop_loss_type' })
    stopLossType: string;

    @Column('text', { nullable: false, name: 'update_grid_interval_type' })
    updateGridIntervalType: string;

    @Column('integer', { nullable: true, name: 'update_grid_interval_time' })
    updateGridIntervalTime: number;

    @OneToOne(
        () => GridSettings,
        (settings: GridSettings) => settings.spotGridSettings,
        { cascade: true }
    )
    @JoinColumn({ name: 'grid_settings_id' })
    gridSettings: GridSettings;

    @OneToOne(
        () => LevelsSettings,
        (settings: LevelsSettings) => settings.spotGridSettings,
        { cascade: true }
    )
    @JoinColumn({ name: 'levels_settings_id' })
    levelsSettings: LevelsSettings;

    @OneToOne(() => Bots, (bot: Bots) => bot.spotGridSettings, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'bot_id' })
    bot: Bots;
}
