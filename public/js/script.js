const socket = io();

socket.on('updateProducts', (products) => {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    products.forEach(product => {
        const listItem = document.createElement('li');
        listItem.id = `product-${product.id}`;
        listItem.innerHTML = `${product.title} - ${product.price} <button onclick="deleteProduct(${product.id})">Excluir</button>`;
        productList.appendChild(listItem);
    });
});

function deleteProduct(id) {
    fetch(`/products/${id}`, { method: 'DELETE' })
        .then(() => {
            socket.emit('productDeleted');
        });
}
