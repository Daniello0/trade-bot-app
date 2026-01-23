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

    @Column('integer', { nullable: false })
    countStatic: number;

    @Column('numeric', { nullable: false })
    pricePerBetStatic: number;

    @OneToOne(
        () => SpotGridSettings,
        (settings: SpotGridSettings) => settings.levelsSettings,
        {
            onDelete: 'CASCADE',
        }
    )
    @JoinColumn({ name: 'spotGridSettingsId' })
    spotGridSettings: SpotGridSettings;
}
