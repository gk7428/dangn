import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import { Product } from '@/data/products';

type DbRow = {
  id: string;
  title: string;
  location: string;
  time_ago: string;
  price: string;
  likes: number;
  color: string;
  description: string;
  photo_uri: string | null;
  required_tier: 'free' | 'paid';
  created_at: string;
};

function rowToProduct(row: DbRow): Product {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    timeAgo: row.time_ago,
    price: row.price,
    likes: row.likes,
    color: row.color,
    description: row.description,
    photoUri: row.photo_uri ?? undefined,
    requiredTier: row.required_tier,
  };
}

function productToRow(p: Product): Omit<DbRow, 'created_at' | 'required_tier'> {
  return {
    id: p.id,
    title: p.title,
    location: p.location,
    time_ago: p.timeAgo,
    price: p.price,
    likes: p.likes,
    color: p.color,
    description: p.description,
    photo_uri: p.photoUri ?? null,
  };
}

type ProductsContextValue = {
  products: Product[];
  loading: boolean;
  addProduct: (product: Product) => Promise<void>;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const { account } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [account?.tier, account?.role]);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts((data as DbRow[]).map(rowToProduct));
    }
    setLoading(false);
  }

  async function addProduct(product: Product) {
    const { data, error } = await supabase
      .from('products')
      .insert(productToRow(product))
      .select()
      .single();

    if (!error && data) {
      setProducts((prev) => [rowToProduct(data as DbRow), ...prev]);
    }
  }

  return (
    <ProductsContext.Provider value={{ products, loading, addProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
