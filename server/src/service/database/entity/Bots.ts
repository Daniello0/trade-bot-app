import 'reflect-metadata';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { FullSpotSettings } from './full_spot/FullSpotSettings';
import { SpotGridSettings } from './grid_spot/SpotGridSettings';
import { Users } from './Users';

@Entity('bots')
export class Bots {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column('text', {
        nullable: false,
    })
    user_id: string;

    @Column('text', {
        nullable: false,
    })
    name: string;

    @Column('numeric', {
        nullable: false,
    })
    deposit: number;

    @Column('text', {
        nullable: false,
    })
    bot_type: string;

    /*@ManyToOne(() => Users, (user: Users) => user.bots)
    @JoinColumn({ name: 'user_id' })
    user: Users;*/

    @OneToOne(() => FullSpotSettings, {
        nullable: true,
        cascade: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'full_spot_bot_settings_id' })
    full_spot_settings: FullSpotSettings;

    @OneToOne(() => SpotGridSettings, {
        nullable: true,
        cascade: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'spot_grid_bot_settings_id' })
    spot_grid_settings: SpotGridSettings;

    @ManyToOne(() => Users, (user: Users) => user.bots)
    @JoinColumn({ name: 'user_id' })
    user: Users;
}
