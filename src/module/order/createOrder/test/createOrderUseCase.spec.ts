import { describe, expect, test } from '@jest/globals';
import { CreateOrderUseCase } from '../createOrderUseCase';
import { CreateOrderRepository } from '../createOrderRepository';
import { Order, OrderStatus } from '../../Order';

class CreateOrderDummyRepository implements CreateOrderRepository {
    async save(order: Order): Promise<void> {
        // Repository factice : aucune action supplémentaire n'est nécessaire pour ce test.
    }
}

describe('US-Order : Créer une commande', () => {
    test('Scénario 1 : création réussie retourne la commande', async () => {
        const createOrderRepository = new CreateOrderDummyRepository();
        const createOrderUseCase = new CreateOrderUseCase(createOrderRepository);

        const createdOrder = await createOrderUseCase.execute({ productIds: [1, 2], totalPrice: 120 });

        expect(createdOrder).toBeInstanceOf(Order);
        expect(createdOrder.productIds).toEqual([1, 2]);
        expect(createdOrder.totalPrice).toBe(120);
        expect(createdOrder.status).toBe(OrderStatus.PENDING);
        expect(createdOrder.createdAt).toBeInstanceOf(Date);
    });

    test('Scénario 2 : erreur si plus de cinq produits', async () => {
        const createOrderRepository = new CreateOrderDummyRepository();
        const createOrderUseCase = new CreateOrderUseCase(createOrderRepository);

        await expect(
            createOrderUseCase.execute({ productIds: [1, 2, 3, 4, 5, 6], totalPrice: 120 })
        ).rejects.toThrow('Une commande doit contenir entre 1 et 5 produits');
    });
});
