export const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(0); // Use 0 for whole numbers in Taka
};

export const updateCart = (state) => {
    // Calculate items price
    state.itemsPrice = addDecimals(
        state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    );

    // Dynamic shipping logic is now handled in the Page components based on distance
    // We only persist itemsPrice and cartItems to localStorage
    
    localStorage.setItem('cartItems', JSON.stringify(state));

    return state;
};
