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

    @Column('text', { nullable: false, name: 'candleLength' })
    candleLength: '1' | '5';

    @Column('text', { nullable: false })
    crypto: string;

    @OneToOne(
        () => GridSettings,
        (settings: GridSettings) => settings.spotGridSettings,
        { cascade: true }
    )
    gridSettings: GridSettings;

    @OneToOne(
        () => LevelsSettings,
        (settings: LevelsSettings) => settings.spotGridSettings,
        { cascade: true }
    )
    levelsSettings: LevelsSettings;

    @OneToOne(() => Bots, (bot: Bots) => bot.spotGridSettings, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'botId' })
    bot: Bots;
}
