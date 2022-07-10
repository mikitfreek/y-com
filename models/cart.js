module.exports = function Cart(cart) {
    this.items = cart.items || {};
    this.totalItems = cart.totalItems || 0;
    this.totalPrice = cart.totalPrice || 0;

    this.add = function(item, id) {
        var cartItem = this.items[id];
        if (!cartItem) {
            cartItem = this.items[id] = {item: item, quantity: 0, price: 0};
        }
        cartItem.quantity++;
        cartItem.price = cartItem.item.price * cartItem.quantity;
        this.totalItems++;
        this.totalPrice += cartItem.item.price;
    };

    this.remove = function(id) {
        if (this.items[id].quantity != 1) {
            this.totalItems -= 1;
            let prc = this.items[id].price / this.items[id].quantity;
            this.totalPrice -= prc;

            this.items[id].quantity -= 1;
            this.items[id].price -= prc;
        } else { //if last item is deleted
            this.totalItems -= this.items[id].quantity;
            this.totalPrice -= this.items[id].price;
            delete this.items[id];
        }
    };
    
    this.getItems = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};