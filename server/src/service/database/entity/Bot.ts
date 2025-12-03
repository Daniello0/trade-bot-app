import 'reflect-metadata';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('bot')
export class Bot {
    @PrimaryColumn('bigint', {
        nullable: false,
    })
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

    @Column('integer', {
        nullable: false,
    })
    bot_settings_id: number;
}
