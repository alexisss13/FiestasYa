import { calculateSubtotal, calculateDiscount, calculateTotal } from '../cart-calculator';

describe('Cart Calculator Logic', () => {
    
    const mockItems = [
        { price: 100, quantity: 2 }, // 200
        { price: 50, quantity: 1 }   // 50 -> Total 250
    ];

    test('Debe calcular el subtotal correctamente', () => {
        const total = calculateSubtotal(mockItems);
        expect(total).toBe(250);
    });

    test('Debe aplicar descuento FIJO correctamente', () => {
        const subtotal = 250;
        const coupon = { code: 'TEST', discount: 50, type: 'FIXED' as const };
        const discount = calculateDiscount(subtotal, coupon);
        expect(discount).toBe(50);
    });

    test('Debe aplicar descuento PORCENTUAL correctamente', () => {
        const subtotal = 200;
        const coupon = { code: 'TEST', discount: 10, type: 'PERCENTAGE' as const }; // 10% de 200 = 20
        const discount = calculateDiscount(subtotal, coupon);
        expect(discount).toBe(20);
    });

    test('El descuento no debe exceder el subtotal (Regla de Negocio)', () => {
        const subtotal = 100;
        const coupon = { code: 'TEST', discount: 150, type: 'FIXED' as const };
        const discount = calculateDiscount(subtotal, coupon);
        
        // No te puede salir debiendo plata la tienda
        expect(discount).toBe(100); 
    });

    test('Cálculo final con envío', () => {
        const subtotal = 250;
        const discount = 50;
        const shipping = 10;
        
        const final = calculateTotal(subtotal, discount, shipping);
        expect(final).toBe(210); // 250 - 50 + 10
    });
});