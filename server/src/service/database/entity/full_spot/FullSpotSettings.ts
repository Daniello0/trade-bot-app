import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('full_spot_settings')
export class FullSpotSettings {
    @PrimaryColumn('bigint', {
        nullable: false,
    })
    id: number;

    @Column('text', {
        nullable: false,
    })
    ignore_list: string;

    @Column('integer', {
        nullable: false,
    })
    max_active_cryptos: number;

    @Column('numeric', {
        nullable: false,
    })
    price_per_bet: number;

    @Column('text', {
        nullable: false,
    })
    crypto_list_type: string;

    @Column('text', {
        nullable: true,
    })
    crypto_list_static: string;

    @Column('text', {
        nullable: false,
    })
    indicators: string;

    @Column('numeric', {
        nullable: false,
    })
    profit_per_crypto: number;

    @Column('integer', {
        nullable: false,
    })
    stop_loss_settings_id: number;

    @Column('integer', {
        nullable: false,
    })
    bot_id: number;
}
