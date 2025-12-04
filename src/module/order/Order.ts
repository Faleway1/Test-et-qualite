import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column('simple-array')
    public productIds: number[];

    @Column({ type: 'float' })
    public totalPrice: number;

    @CreateDateColumn()
    public createdAt: Date;

    @Column({
        type: 'varchar',
        length: 50,
        default: OrderStatus.PENDING
    })
    public status: OrderStatus;

    constructor(productIds?: number[], totalPrice?: number) {
        if (productIds !== undefined && totalPrice !== undefined) {
            if (productIds.length < 1 || productIds.length > 5) {
                throw new Error('Une commande doit contenir entre 1 et 5 produits');
            }

            if (totalPrice < 2 || totalPrice > 500) {
                throw new Error('Le prix total doit être compris entre 2€ et 500€');
            }

            this.productIds = productIds;
            this.totalPrice = totalPrice;
            this.status = OrderStatus.PENDING;
            this.createdAt = new Date();
        }
    }
}
