import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('levels_settings')
export class LevelsSettings {
    @PrimaryColumn('bigint', {
        nullable: false,
    })
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

    @Column('integer', {
        nullable: false,
    })
    spot_grid_settings_id: number;
}
