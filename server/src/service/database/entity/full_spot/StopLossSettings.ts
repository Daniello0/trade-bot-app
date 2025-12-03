import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('stop_loss_settings')
export class StopLossSettings {
    @PrimaryColumn('bigint', {
        nullable: false,
    })
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

    @Column('integer', {
        nullable: false,
    })
    full_spot_settings_id: number;
}
