export declare class Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    hasStock(quantity: number): boolean;
    decreaseStock(quantity: number): void;
}
