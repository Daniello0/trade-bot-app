import 'reflect-metadata';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryColumn('text', {
        nullable: false,
    })
    id: string;

    @Column('timestamp without time zone', {
        nullable: false,
    })
    created_at: Date;
}
