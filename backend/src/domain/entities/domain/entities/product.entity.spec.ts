import { Product } from './product.entity';

describe('Product', () => {
  let product: Product;

  beforeEach(() => {
    product = new Product();
    product.id = 'prod_1';
    product.name = 'Test Product';
    product.description = 'Test Description';
    product.price = 1000;
    product.stock = 10;
    product.imageUrl = 'http://example.com/image.png';
  });

  describe('hasStock', () => {
    it('should return true when there is sufficient stock', () => {
      // Act
      const result = product.hasStock(5);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when requested quantity equals stock', () => {
      // Act
      const result = product.hasStock(10);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when there is insufficient stock', () => {
      // Act
      const result = product.hasStock(15);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when stock is zero', () => {
      // Arrange
      product.stock = 0;

      // Act
      const result = product.hasStock(1);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when requesting zero quantity', () => {
      // Act
      const result = product.hasStock(0);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle negative stock requests', () => {
      // Act
      const result = product.hasStock(-5);

      // Assert
      expect(result).toBe(true); // Should handle negative gracefully
    });
  });

  describe('decreaseStock', () => {
    it('should decrease stock successfully when there is sufficient stock', () => {
      // Arrange
      const initialStock = product.stock;
      const quantityToDecrease = 3;

      // Act
      product.decreaseStock(quantityToDecrease);

      // Assert
      expect(product.stock).toBe(initialStock - quantityToDecrease);
    });

    it('should decrease stock to zero when decreasing all stock', () => {
      // Act
      product.decreaseStock(10);

      // Assert
      expect(product.stock).toBe(0);
    });

    it('should throw error when trying to decrease more than available stock', () => {
      // Act & Assert
      expect(() => product.decreaseStock(15)).toThrow(
        'Insufficient stock for product "Test Product"',
      );
      expect(product.stock).toBe(10); // Stock should remain unchanged
    });

    it('should throw error when stock is zero and trying to decrease', () => {
      // Arrange
      product.stock = 0;

      // Act & Assert
      expect(() => product.decreaseStock(1)).toThrow(
        'Insufficient stock for product "Test Product"',
      );
      expect(product.stock).toBe(0); // Stock should remain unchanged
    });

    it('should not change stock when decreasing zero quantity', () => {
      // Arrange
      const initialStock = product.stock;

      // Act
      product.decreaseStock(0);

      // Assert
      expect(product.stock).toBe(initialStock);
    });

    it('should throw error with correct product name in error message', () => {
      // Arrange
      product.name = 'Special Product';

      // Act & Assert
      expect(() => product.decreaseStock(15)).toThrow(
        'Insufficient stock for product "Special Product"',
      );
    });

    it('should handle edge case of decreasing exactly available stock', () => {
      // Act
      product.decreaseStock(10);

      // Assert
      expect(product.stock).toBe(0);
    });
  });

  describe('product properties', () => {
    it('should have all required properties', () => {
      // Assert
      expect(product.id).toBe('prod_1');
      expect(product.name).toBe('Test Product');
      expect(product.description).toBe('Test Description');
      expect(product.price).toBe(1000);
      expect(product.stock).toBe(10);
      expect(product.imageUrl).toBe('http://example.com/image.png');
    });

    it('should allow property updates', () => {
      // Act
      product.name = 'Updated Product';
      product.price = 2000;
      product.stock = 20;
      product.description = 'Updated Description';
      product.imageUrl = 'http://example.com/updated-image.png';

      // Assert
      expect(product.name).toBe('Updated Product');
      expect(product.price).toBe(2000);
      expect(product.stock).toBe(20);
      expect(product.description).toBe('Updated Description');
      expect(product.imageUrl).toBe('http://example.com/updated-image.png');
    });

    it('should handle zero price', () => {
      // Act
      product.price = 0;

      // Assert
      expect(product.price).toBe(0);
    });

    it('should handle negative price', () => {
      // Act
      product.price = -100;

      // Assert
      expect(product.price).toBe(-100);
    });

    it('should handle very large numbers', () => {
      // Act
      product.price = 999999999;
      product.stock = 999999;

      // Assert
      expect(product.price).toBe(999999999);
      expect(product.stock).toBe(999999);
    });
  });

  describe('product validation scenarios', () => {
    it('should handle product with minimum stock', () => {
      // Arrange
      product.stock = 1;

      // Act & Assert
      expect(product.hasStock(1)).toBe(true);
      expect(product.hasStock(2)).toBe(false);
    });

    it('should handle product with maximum stock', () => {
      // Arrange
      product.stock = Number.MAX_SAFE_INTEGER;

      // Act & Assert
      expect(product.hasStock(1000)).toBe(true);
      expect(product.hasStock(Number.MAX_SAFE_INTEGER)).toBe(true);
    });

    it('should handle product with special characters in name', () => {
      // Arrange
      product.name = 'Product with special chars: !@#$%^&*()';

      // Act & Assert
      expect(() => product.decreaseStock(15)).toThrow(
        'Insufficient stock for product "Product with special chars: !@#$%^&*()"',
      );
    });

    it('should handle product with empty name', () => {
      // Arrange
      product.name = '';

      // Act & Assert
      expect(() => product.decreaseStock(15)).toThrow(
        'Insufficient stock for product ""',
      );
    });
  });
});
