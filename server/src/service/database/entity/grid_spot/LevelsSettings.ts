import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { SpotGridSettings } from './SpotGridSettings';

@Entity('levels_settings')
export class LevelsSettings {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column('text', {
        nullable: false,
    })
    type: string;

    @Column('integer', {
        nullable: true,
    })
    count_static: number;

    @Column('numeric', {
        nullable: true,
    })
    price_per_bet_static: number;

    @Column('numeric', {
        nullable: true,
    })
    profit_dynamic: number;

    @OneToOne(
        () => SpotGridSettings,
        (settings: SpotGridSettings) => settings.levels_settings,
        {
            onDelete: 'CASCADE',
        }
    )
    @JoinColumn({ name: 'spot_grid_settings_id' })
    spot_grid_settings: SpotGridSettings;
}
