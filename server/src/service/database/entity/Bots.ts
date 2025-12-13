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

    @OneToOne(() => FullSpotSettings, (settings) => settings.bot, {
        nullable: true,
        cascade: true,
    })
    full_spot_settings: FullSpotSettings;

    @OneToOne(() => SpotGridSettings, (settings) => settings.bot, {
        nullable: true,
        cascade: true,
    })
    spot_grid_settings: SpotGridSettings;

    @ManyToOne(() => Users, (user: Users) => user.bots, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: Users;
}
