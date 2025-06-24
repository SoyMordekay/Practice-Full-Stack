import { ProductRepository } from './product.repository';
import { Product } from '../../../../domain/entities/domain/entities/product.entity';

describe('ProductRepository', () => {
  let repository: ProductRepository;

  // Simulación de la fuente de datos (puedes ajustar según tu implementación real)
  let products: Product[];

  beforeEach(() => {
    products = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Desc 1',
        price: 100,
        stock: 10,
        imageUrl: 'img1',
        hasStock: function (q: number) { return this.stock >= q; },
        decreaseStock: function (q: number) { if (this.stock >= q) this.stock -= q; },
      },
      {
        id: '2',
        name: 'Product 2',
        description: 'Desc 2',
        price: 200,
        stock: 5,
        imageUrl: 'img2',
        hasStock: function (q: number) { return this.stock >= q; },
        decreaseStock: function (q: number) { if (this.stock >= q) this.stock -= q; },
      },
    ];
    repository = new ProductRepository();
    // @ts-ignore
    repository.products = products;
  });

  it('should find a product by id', async () => {
    // @ts-ignore
    repository.products = products;
    const product = await repository.findById('1');
    expect(product).toEqual(products[0]);
  });

  it('should return null if product not found', async () => {
    // @ts-ignore
    repository.products = products;
    const product = await repository.findById('999');
    expect(product).toBeNull();
  });

  it('should decrease stock of a product', async () => {
    // @ts-ignore
    repository.products = products;
    await repository.decreaseStock('1', 3);
    expect(products[0].stock).toBe(7);
  });

  it('should not decrease stock if product not found', async () => {
    // @ts-ignore
    repository.products = products;
    await expect(repository.decreaseStock('999', 2)).rejects.toThrow();
  });

  it('should create a new product', async () => {
    const newProduct: Product = {
      id: '3',
      name: 'Product 3',
      description: 'Desc 3',
      price: 300,
      stock: 20,
      imageUrl: 'img3',
      hasStock: function (q: number) { return this.stock >= q; },
      decreaseStock: function (q: number) { if (this.stock >= q) this.stock -= q; },
    };
    // @ts-ignore
    repository.products = products;
    await repository.create(newProduct);
    expect(products.length).toBe(3);
    expect(products[2]).toEqual(newProduct);
  });

  it('should update a product', async () => {
    // @ts-ignore
    repository.products = products;
    const updated = { ...products[0], name: 'Updated Name' };
    await repository.update(updated);
    expect(products[0].name).toBe('Updated Name');
  });

  it('should delete a product', async () => {
    // @ts-ignore
    repository.products = products;
    await repository.delete('1');
    expect(products.length).toBe(1);
    expect(products[0].id).toBe('2');
  });

  it('should return all products', async () => {
    // @ts-ignore
    repository.products = products;
    const all = await repository.findAll();
    expect(all.length).toBe(2);
    expect(all[0].id).toBe('1');
    expect(all[1].id).toBe('2');
  });
}); 