import 'reflect-metadata';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import { FullSpotSettings } from './full_spot/FullSpotSettings';
import { SpotGridSettings } from './grid_spot/SpotGridSettings';
import { Users } from './Users';

@Entity('bots')
@Unique(['user', 'name'])
export class Bots {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column('text', { nullable: false })
    name: string;

    @Column('numeric', { nullable: false })
    deposit: number;

    @Column('text', { nullable: false })
    bot_type: string;

    @OneToOne(() => FullSpotSettings, {
        nullable: true,
        cascade: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'full_spot_bot_settings_id' })
    full_spot_settings: FullSpotSettings;

    @OneToOne(() => SpotGridSettings, {
        nullable: true,
        cascade: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'spot_grid_bot_settings_id' })
    spot_grid_settings: SpotGridSettings;

    @ManyToOne(() => Users, (user: Users) => user.bots, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: Users;
}
