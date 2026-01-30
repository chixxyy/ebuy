import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// In-memory debounce timers
// Map<userId, NodeJS.Timeout>
const debounceTimers = new Map<number, NodeJS.Timeout>();

// In-memory pending requests to accumulate quantity
// Map<userId, Map<productId, quantity>>
const pendingUpdates = new Map<number, Map<number, number>>();

const DEBOUNCE_DELAY = 500; // 500ms

export const addToCartDebounced = async (userId: number, productId: number, quantity: number) => {
    // 1. Accumulate quantity
    if (!pendingUpdates.has(userId)) {
        pendingUpdates.set(userId, new Map());
    }
    const userUpdates = pendingUpdates.get(userId)!;
    const currentQty = userUpdates.get(productId) || 0;
    userUpdates.set(productId, currentQty + quantity);

    console.log(`[Debounce] User ${userId} requested add ${quantity} for Product ${productId}. Pending total: ${currentQty + quantity}`);

    // 2. Clear existing timer
    if (debounceTimers.has(userId)) {
        clearTimeout(debounceTimers.get(userId));
    }

    // 3. Set new timer
    const timer = setTimeout(async () => {
        debounceTimers.delete(userId);
        const finalUpdates = pendingUpdates.get(userId);
        pendingUpdates.delete(userId); // Clear pending

        if (!finalUpdates) return;

        console.log(`[Debounce] Executing updates for User ${userId}`, [...finalUpdates.entries()]);

        // Process updates
        try {
            await processCartUpdates(userId, finalUpdates);
        } catch (error) {
            console.error(`[Debounce] Error processing cart for User ${userId}:`, error);
        }

    }, DEBOUNCE_DELAY);

    debounceTimers.set(userId, timer);

    return { status: 'queued', message: 'Request queued for debounce' };
};

const processCartUpdates = async (userId: number, updates: Map<number, number>) => {
    // Transaction for safety
    await prisma.$transaction(async (tx) => {
        // Ensure Cart exists
        let cart = await tx.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await tx.cart.create({ data: { userId } });
        }

        for (const [productId, quantity] of updates.entries()) {
            // Check Stock
            const product = await tx.product.findUnique({ where: { id: productId } });
            if (!product) continue; // Skip invalid products

            // Check if cart item exists to know current quantity if needed, 
            // but for "adding", we usually add to existing. 
            // Wait, the request is "add to cart", so quantity is delta.
            
            if (product.stock < quantity) {
                console.warn(`[Stock] Not enough stock for Product ${productId}. Requested: ${quantity}, Available: ${product.stock}`);
                // Ideally we should notify the user via socket or just fail silently/log for now as response is already sent.
                // In a real app, this might be handled differently.
                continue; 
            }

            // Decrement Stock
            await tx.product.update({
                where: { id: productId },
                data: { stock: { decrement: quantity } }
            });

            // Update Cart Item
            const existingItem = await tx.cartItem.findFirst({
                where: { cartId: cart.id, productId }
            });

            if (existingItem) {
                await tx.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: { increment: quantity } }
                });
            } else {
                await tx.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId,
                        quantity
                    }
                });
            }
        }
    });
};

export const getCart = async (userId: number) => {
    return prisma.cart.findUnique({
        where: { userId },
        include: { 
            items: {
                include: { product: true }
            } 
        }
    });
};
