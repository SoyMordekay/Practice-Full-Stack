"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
class Product {
    id;
    name;
    description;
    price;
    stock;
    imageUrl;
    createdAt;
    updatedAt;
    hasStock(quantity) {
        return this.stock >= quantity;
    }
    decreaseStock(quantity) {
        if (!this.hasStock(quantity)) {
            throw new Error(`Insufficient stock for product "${this.name}"`);
        }
        this.stock -= quantity;
    }
}
exports.Product = Product;
//# sourceMappingURL=product.entity.js.map