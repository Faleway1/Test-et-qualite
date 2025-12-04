import { CreateOrderRepository } from './createOrderRepository';
import { Order } from '../Order';

type CreateOrderCommand = {
    productIds: number[];
    totalPrice: number;
};

export class CreateOrderUseCase {
    private orderRepository: CreateOrderRepository;

    constructor(orderRepository: CreateOrderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(command: CreateOrderCommand): Promise<Order> {
        const { productIds, totalPrice } = command;

        const order = new Order(productIds, totalPrice);

        try {
            await this.orderRepository.save(order);
            return order;
        } catch (error) {
            throw new Error('Erreur lors de la création de la commande');
        }
    }
}
