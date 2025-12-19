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

    @Column('text', {
        nullable: false,
    })
    type: string;

    @Column('numeric', {
        nullable: true,
    })
    lower_bound_static: number;

    @Column('numeric', {
        nullable: true,
    })
    upper_bound_static: number;

    @Column('text', {
        nullable: true,
    })
    lower_bound_dynamic: string;

    @Column('text', {
        nullable: true,
    })
    upper_bound_dynamic: string;

    @OneToOne(
        () => SpotGridSettings,
        (settings: SpotGridSettings) => settings.grid_settings,
        {
            onDelete: 'CASCADE',
        }
    )
    @JoinColumn({ name: 'spot_grid_settings_id' })
    spot_grid_settings: SpotGridSettings;
}
