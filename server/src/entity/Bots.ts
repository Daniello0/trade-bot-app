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
import { SpotGridSettings } from './SpotGridSettings';
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
    botType: string;

    // TODO: enum
    @Column('text', { nullable: false, default: 'stopped' })
    status: 'stopped' | 'running';

    @OneToOne(() => SpotGridSettings, (settings) => settings.bot, {
        nullable: true,
        cascade: true,
    })
    spotGridSettings: SpotGridSettings;

    @ManyToOne(() => Users, (user: Users) => user.bots, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'userEmail',
        referencedColumnName: 'email', // TODO: join by id
    })
    user: Users;
}
