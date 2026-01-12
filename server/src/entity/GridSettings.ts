import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { SpotGridSettings } from './SpotGridSettings';

@Entity('grid_settings')
export class GridSettings {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column('text', { nullable: false })
    type: string;

    @Column('numeric', { nullable: true })
    lowerBoundStatic: number;

    @Column('numeric', { nullable: true })
    upperBoundStatic: number;

    @Column('text', { nullable: true })
    lowerBoundDynamic: string;

    @Column('text', { nullable: true })
    upperBoundDynamic: string;

    @OneToOne(
        () => SpotGridSettings,
        (settings: SpotGridSettings) => settings.gridSettings,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'spotGridSettingsId' })
    spotGridSettings: SpotGridSettings;
}
