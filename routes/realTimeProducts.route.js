const socket = io();

socket.on('updateProducts', (products) => {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    products.forEach(product => {
        const li = document.createElement('li');
        li.textContent = `${product.title} - $${product.price}`;
        productList.appendChild(li);
    });
});

document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const price = document.getElementById('price').value;
    socket.emit('newProduct', { title, price });

    document.getElementById('title').value = '';
    document.getElementById('price').value = '';
});