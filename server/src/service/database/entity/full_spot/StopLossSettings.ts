import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { FullSpotSettings } from './FullSpotSettings';

@Entity('stop_loss_settings')
export class StopLossSettings {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column('text', {
        nullable: false,
    })
    stop_loss_type: string;

    @Column('numeric', {
        nullable: true,
    })
    stop_loss_interval_value: number;

    @Column('integer', {
        nullable: true,
    })
    stop_loss_time_value: number;

    @OneToOne(
        () => FullSpotSettings,
        (settings: FullSpotSettings) => settings.stop_loss_settings,
        {
            onDelete: 'CASCADE',
        }
    )
    @JoinColumn({ name: 'full_spot_settings_id' })
    full_spot_settings: FullSpotSettings;
}
