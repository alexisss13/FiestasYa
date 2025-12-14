/**
 * Lógica pura de negocio para el carrito de compras.
 * * Reglas:
 * 1. Precios siempre positivos.
 * 2. Descuentos no pueden superar el total.
 * 3. Cálculos precisos (aunque JS usa float, para e-commerce simple basta Math.max).
 */

export type CartItemCalc = {
    price: number;
    quantity: number;
};

export type CouponCalc = {
    code: string;
    discount: number;
    type: 'FIXED' | 'PERCENTAGE';
};

// 1. Calcular Subtotal
export const calculateSubtotal = (items: CartItemCalc[]): number => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// 2. Calcular Descuento
export const calculateDiscount = (subtotal: number, coupon: CouponCalc | null): number => {
    if (!coupon) return 0;
    
    let discountAmount = 0;

    if (coupon.type === 'FIXED') {
        discountAmount = coupon.discount;
    } else if (coupon.type === 'PERCENTAGE') {
        discountAmount = (subtotal * coupon.discount) / 100;
    }

    // Regla de Oro: El descuento nunca puede ser mayor que el subtotal
    return Math.min(discountAmount, subtotal);
};

// 3. Calcular Total Final
export const calculateTotal = (subtotal: number, discount: number, shipping: number = 0): number => {
    return Math.max(0, subtotal - discount + shipping);
};