import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('grid_settings')
export class GridSettings {
    @PrimaryColumn('bigint', {
        nullable: false,
    })
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

    @Column('integer', {
        nullable: false,
    })
    spot_grid_settings_id: number;
}
