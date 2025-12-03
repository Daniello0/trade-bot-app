import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('spot_grid_settings')
export class SpotGridSettings {
    @PrimaryColumn('bigint', {
        nullable: false,
    })
    id: number;

    @Column('integer', {
        nullable: false,
    })
    history_length: number;

    @Column('integer', {
        nullable: false,
    })
    candle_length: number;

    @Column('text', {
        nullable: false,
    })
    crypto: string;

    @Column('integer', {
        nullable: false,
    })
    grid_settings_id: number;

    @Column('integer', {
        nullable: false,
    })
    levels_settings_id: number;

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

    @Column('integer', {
        nullable: false,
    })
    bot_id: number;
}
