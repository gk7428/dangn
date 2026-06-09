import { createContext, useContext, useState, ReactNode } from 'react';

import { PRODUCTS, Product } from '@/data/products';

type ProductsContextValue = {
  products: Product[];
  addProduct: (product: Product) => void;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  function addProduct(product: Product) {
    setProducts((prev) => [product, ...prev]);
  }

  return (
    <ProductsContext.Provider value={{ products, addProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
