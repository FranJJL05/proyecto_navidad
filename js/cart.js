// js/cart.js

// Función para añadir productos (Lógica de negocio + Persistencia)
export function agregarAlCarrito(elemento) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    
    // Buscamos si el producto ya existe por su ID
    const existente = carrito.find(item => item.id === elemento.id);

    if (existente) {
        existente.cantidad++; // Si existe, sumamos 1
    } else {
        // Si no, lo añadimos con cantidad 1 inicial
        carrito.push({ ...elemento, cantidad: 1 });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito(); // Actualizamos el visual
    actualizarContador();
}

// Función para pintar el carrito en el Modal
export function mostrarCarrito() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const contenedor = document.getElementById('lista-carrito');
    const totalElement = document.getElementById('precio-total');
    
    contenedor.innerHTML = "";
    let total = 0;

    carrito.forEach((element, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item-carrito'); // Clase BEM
        
        const subtotal = element.price * element.cantidad;
        total += subtotal;

        itemDiv.innerHTML = `
            <div class="item-carrito__info">
                <h4>${element.title}</h4>
                <p>${element.price} € x ${element.cantidad} = <strong>${subtotal.toFixed(2)} €</strong></p>
            </div>
            <div class="item-carrito__controles">
                <button class="boton boton--secundario restar-btn" data-idx="${index}">-</button>
                <button class="boton boton--peligro eliminar-btn" data-idx="${index}">🗑</button>
            </div>
        `;
        
        // Añadimos los eventos a los botones generados dinámicamente
        // Nota: Usamos funciones internas auxiliares para la lógica de estos botones
        itemDiv.querySelector('.restar-btn').addEventListener('click', () => modificarCantidad(index, -1));
        itemDiv.querySelector('.eliminar-btn').addEventListener('click', () => eliminarItem(index));

        contenedor.appendChild(itemDiv);
    });

    totalElement.innerText = total.toFixed(2) + " €";
}

// Función pública para actualizar el numerito rojo del carrito
export function actualizarContador() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const count = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const contador = document.getElementById('contador-carrito');
    if(contador) contador.innerText = count;
}

// --- Funciones Internas (No se exportan porque solo se usan aquí dentro) ---

function modificarCantidad(index, delta) {
    let carrito = JSON.parse(localStorage.getItem("carrito"));
    carrito[index].cantidad += delta;
    
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1); // Borrar si baja de 1
    }
    
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
    actualizarContador();
}

function eliminarItem(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito"));
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
    actualizarContador();
}

// Función para vaciar carrito (al comprar)
export function vaciarCarrito() {
    localStorage.removeItem("carrito");
    mostrarCarrito();
    actualizarContador();
}