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

    @Column('integer', {
        nullable: false,
    })
    history_length: number;

    @Column('text', {
        nullable: false,
    })
    candle_length: string;

    @Column('text', {
        nullable: false,
    })
    crypto: string;

    @Column('text', {
        nullable: false,
    })
    stop_loss_type: string;

    @Column('text', {
        nullable: false,
    })
    update_grid_interval_type: string;

    @Column('integer', {
        nullable: true,
    })
    update_grid_interval_time: number;

    @OneToOne(
        () => GridSettings,
        (settings: GridSettings) => settings.spot_grid_settings,
        {
            cascade: true,
        }
    )
    grid_settings: GridSettings;

    @OneToOne(
        () => LevelsSettings,
        (settings: LevelsSettings) => settings.spot_grid_settings,
        {
            cascade: true,
        }
    )
    levels_settings: LevelsSettings;

    @OneToOne(() => Bots, (bot: Bots) => bot.spot_grid_settings, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'bot_id' })
    bot: Bots;
}
