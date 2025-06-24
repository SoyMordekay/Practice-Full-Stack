export class Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;

  /**
   * Verifica si hay suficiente stock para la cantidad solicitada.
   * @param quantity La cantidad a verificar.
   * @returns `true` si hay stock, `false` en caso contrario.
   */
  public hasStock(quantity: number): boolean {
    return this.stock >= quantity;
  }

  /**
   * Disminuye el stock del producto.
   * Arroja un error si no hay suficiente stock.
   * @param quantity La cantidad a disminuir.
   */
  public decreaseStock(quantity: number): void {
    if (!this.hasStock(quantity)) {
      throw new Error(`Insufficient stock for product "${this.name}"`);
    }
    this.stock -= quantity;
  }
}
