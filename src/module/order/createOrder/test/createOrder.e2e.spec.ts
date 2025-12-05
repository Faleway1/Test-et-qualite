import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { Express } from 'express';
import { Order } from '../../Order';
import { buildApp } from '../../../../config/app';

describe('US-2 : Créer une commande - E2E', () => {
    let container: StartedPostgreSqlContainer;
    let dataSource: DataSource;
    let app: Express;

    beforeAll(async () => {
        container = await new PostgreSqlContainer('postgres:16').withExposedPorts(5432).start();

        dataSource = new DataSource({
            type: 'postgres',
            host: container.getHost(),
            port: container.getPort(),
            username: container.getUsername(),
            password: container.getPassword(),
            database: container.getDatabase(),
            logging: false,
            entities: [Order],
            synchronize: true,
            entitySkipConstructor: true
        });

        await dataSource.initialize();

        const AppDataSource = require('../../../../config/db.config').default;

        app = buildApp();

        Object.assign(AppDataSource, dataSource);
    });

    afterAll(async () => {
        if (dataSource?.isInitialized) {
            await dataSource.destroy();
        }
        if (container) {
            await container.stop();
        }
    });

    test('Scénario 1 : création réussie', async () => {
        // Étant donné qu\'il n\'y a pas de commande enregistrée
        await dataSource.getRepository(Order).clear();

        // Quand je créé une commande avec deux produits et un prix total valide
        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [1, 2],
                totalPrice: 100
            })
            .set('Content-Type', 'application/json');

        // Alors la commande doit être créée
        expect(response.status).toBe(201);
        const orders = await dataSource.getRepository(Order).find();
        expect(orders).toHaveLength(1);
        expect(orders[0].totalPrice).toBe(100);
        expect(orders[0].status).toBe('PENDING');
        expect(orders[0].productIds.map(Number)).toEqual([1, 2]);
    });

    test('Scénario 2 : création échouée - plus de cinq produits', async () => {
        // Étant donné qu\'il n\'y a pas de commande enregistrée
        await dataSource.getRepository(Order).clear();

        // Quand je créé une commande avec six produits
        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [1, 2, 3, 4, 5, 6],
                totalPrice: 120
            })
            .set('Content-Type', 'application/json');

        // Alors une erreur doit être envoyée
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Une commande doit contenir entre 1 et 5 produits');

        const orders = await dataSource.getRepository(Order).find();
        expect(orders).toHaveLength(0);
    });
});
