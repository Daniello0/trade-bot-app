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

    @Column('text', { nullable: false })
    type: string;

    @Column('integer', { nullable: true })
    countStatic: number;

    @Column('numeric', { nullable: true })
    pricePerBetStatic: number;

    @Column('numeric', { nullable: true })
    profitDynamic: number;

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
