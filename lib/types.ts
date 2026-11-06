export type Money = { amount: string; currencyCode: string };
export type Image = {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
};
export type Meta = { key: string; value: string } | null;
export type Variant = {
  id: string;
  title: string;
  sku: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  price: Money;
  selectedOptions: { name: string; value: string }[];
};
export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  updatedAt: string;
  images: { nodes: Image[] };
  variants: { nodes: Variant[]; pageInfo: { hasNextPage: boolean } };
  metafields: Meta[];
};
export type Line = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: Variant & { product: Product };
};
export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money };
  lines: { nodes: Line[]; pageInfo: { hasNextPage: boolean } };
};
export type PublicCart = {
  lines: {
    id: string;
    quantity: number;
    title: string;
    variant: string;
    handle: string;
    image: Image | null;
    unit: Money;
    total: Money;
    available: boolean;
  }[];
  subtotal: Money;
  total: Money;
  digest: string;
  quantity: number;
  blocked: boolean;
};
