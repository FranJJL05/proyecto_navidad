import { get } from "./httpClient.js";
// Importamos las funciones del carrito para mantener el main limpio
import { agregarAlCarrito, mostrarCarrito, actualizarContador, vaciarCarrito } from "./cart.js";

// --- VARIABLES GLOBALES ---
let productosGlobales = [];    // Almacén de todos los datos
let productosMostrados = [];   // Datos visibles actualmente
let pagina = 0;
const ELEMENTOS_POR_PAGINA = 8;
let cargando = false;          // Control para el scroll infinito

// --- 1. FUNCIÓN PINTAR PRODUCTOS (Equivalente a 'cards') ---
function pintarProductos(listaDeProductos, limpiar = false) {
    const contenedor = document.getElementById('contenedor-productos');

    if (limpiar) {
        contenedor.innerHTML = "";
    }

    listaDeProductos.forEach(elemento => {
        const cardElement = crearTarjeta(elemento);

        // Evento: Click en imagen para ver detalle (Modal)
        const imagen = cardElement.querySelector('.tarjeta__imagen');
        imagen.addEventListener('click', () => mostrarDetalle(elemento));

        // Evento: Click en añadir al carrito (Usa la función importada de cart.js)
        const boton = cardElement.querySelector('.btn-agregar');
        boton.addEventListener('click', () => {
            agregarAlCarrito(elemento);
            // Feedback visual opcional (alert o toast)
            alert("Producto añadido");
        });

        contenedor.appendChild(cardElement);
    });
}

// --- 2. FUNCIÓN CREAR TARJETA (Equivalente a 'card') ---
function crearTarjeta(elemento) {
    const card = document.createElement('article');
    card.classList.add('tarjeta'); // Clase BEM

    // El CSS se encarga del grid irregular (span 2)
    card.innerHTML = `
        <div class="tarjeta__imagen-contenedor">
            <img src="${elemento.image}" alt="${elemento.title}" class="tarjeta__imagen">
        </div>
        <div class="tarjeta__contenido">
            <h3 class="tarjeta__titulo">${elemento.title}</h3>
            <p class="tarjeta__precio">${elemento.price} €</p>
            <button class="boton boton--primario boton--ancho-completo btn-agregar">
                Añadir al Carrito
            </button>
        </div>
    `;
    return card;
}

// --- 3. FUNCIÓN ASÍNCRONA DE DATOS (Equivalente a 'devuelvePersonajes') ---
const obtenerProductos = async () => {
    const urlHombre = "https://fakestoreapi.com/products/category/men's clothing";
    const urlMujer = "https://fakestoreapi.com/products/category/women's clothing";

    try {
        // Hacemos las peticiones en paralelo para que sea más rápido
        const [ropaHombre, ropaMujer] = await Promise.all([
            get(urlHombre),
            get(urlMujer)
        ]);

        // Unimos los arrays
        productosGlobales = [...ropaHombre, ...ropaMujer];

        // Llenamos el select de categorías
        llenarFiltroCategorias(productosGlobales);

        // Iniciamos la carga paginada (Scroll Infinito)
        cargarSiguientesProductos();
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

// --- HELPER: SCROLL INFINITO ---
function cargarSiguientesProductos() {
    // Si ya mostramos todo, salimos
    if (productosMostrados.length >= productosGlobales.length) return;

    cargando = true;
    const spinner = document.getElementById('cargando');
    if (spinner) spinner.classList.remove('oculto');

    // Timeout para simular carga y ver el efecto
    setTimeout(() => {
        const inicio = pagina * ELEMENTOS_POR_PAGINA;
        const fin = inicio + ELEMENTOS_POR_PAGINA;
        const nuevos = productosGlobales.slice(inicio, fin);

        pintarProductos(nuevos, false); // false = añadir al final sin borrar
        productosMostrados = [...productosMostrados, ...nuevos];

        pagina++;
        cargando = false;
        if (spinner) spinner.classList.add('oculto');
    }, 800);
}

// --- HELPER: MODAL DETALLE ---
function mostrarDetalle(producto) {
    const modal = document.getElementById('modal-producto');
    const cuerpo = document.getElementById('detalle-producto-cuerpo');

    // Inyectamos el HTML del detalle
    cuerpo.innerHTML = `
        <img src="${producto.image}" style="max-width:200px; display:block; margin:0 auto 20px;">
        <h2>${producto.title}</h2>
        <p><strong>Categoría:</strong> ${producto.category}</p>
        <p style="margin: 15px 0;">${producto.description}</p>
        <p class="tarjeta__precio" style="font-size: 1.5rem;">${producto.price} €</p>
        <button id="btn-comprar-detalle" class="boton boton--exito boton--ancho-completo">Comprar ahora</button>
    `;

    // Botón comprar dentro del modal
    document.getElementById('btn-comprar-detalle').addEventListener('click', () => {
        agregarAlCarrito(producto);
        modal.classList.remove('mostrar');
    });

    modal.classList.add('mostrar');
}

// --- HELPER: LLENAR SELECT CATEGORIAS ---
function llenarFiltroCategorias(datos) {
    const select = document.getElementById('filtro-categoria');
    // Usamos Set para evitar categorías repetidas
    const categorias = [...new Set(datos.map(item => item.category))];

    // Limpiamos opciones anteriores excepto la primera ("Todas")
    select.innerHTML = '<option value="todas">Todas las categorías</option>';

    categorias.forEach(cat => {
        const op = document.createElement('option');
        op.value = cat;
        op.innerText = cat;
        select.appendChild(op);
    });
}

// --- 4. FUNCIÓN MAIN (ORQUESTADOR) ---
const main = () => {

    // A. SEGURIDAD: Verificar Login
    if (!sessionStorage.getItem("token")) {
        window.location.href = "login.html";
        return;
    }

    // B. CARGAR DATOS INICIALES
    obtenerProductos();

    // C. INICIALIZAR CARRITO VISUALMENTE (Recuperar de localStorage)
    mostrarCarrito();
    actualizarContador();

    // D. CONFIGURAR EVENTOS GLOBALES

    // 1. Scroll Infinito
    window.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        // Si estamos cerca del final (200px) y no estamos cargando
        if (scrollTop + clientHeight >= scrollHeight - 200 && !cargando) {
            cargarSiguientesProductos();
        }
    });

    // 2. Filtro Categoría
    document.getElementById('filtro-categoria').addEventListener('change', (e) => {
        const cat = e.target.value;
        const contenedor = document.getElementById('contenedor-productos');

        contenedor.innerHTML = ""; // Limpiar contenedor
        pagina = 0; // Resetear paginación
        productosMostrados = [];

        if (cat === "todas") {
            cargarSiguientesProductos();
        } else {
            // Filtrado local
            const filtrados = productosGlobales.filter(p => p.category === cat);
            pintarProductos(filtrados, true);
        }
    });

    // 3. Ordenar por Precio
    let ordenAscendente = true;
    document.getElementById('btn-ordenar').addEventListener('click', (e) => {
        // Ordenamos el array global
        productosGlobales.sort((a, b) => {
            return ordenAscendente ? a.price - b.price : b.price - a.price;
        });

        // Actualizamos texto botón
        ordenAscendente = !ordenAscendente;
        e.target.innerText = `Precio ${ordenAscendente ? '⬆' : '⬇'}`;

        // Reiniciamos vista
        pagina = 0;
        productosMostrados = [];
        document.getElementById('contenedor-productos').innerHTML = "";
        cargarSiguientesProductos();
    });

    // 4. Modales (Abrir/Cerrar)
    document.getElementById('btn-abrir-carrito').addEventListener('click', () => {
        mostrarCarrito(); // Aseguramos que esté actualizado al abrir
        document.getElementById('modal-carrito').classList.add('mostrar');
    });

    document.querySelectorAll('.modal__cerrar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('mostrar');
        });
    });

    // 5. Finalizar Compra (Simulación EmailJS)
    document.getElementById('btn-finalizar-compra').addEventListener('click', () => {
        const total = document.getElementById('precio-total').innerText;

        // 1. Recuperamos quién es el usuario conectado
        const usuarioGuardado = JSON.parse(sessionStorage.getItem("usuario"));

        if (total === "0.00 €") {
            alert("El carrito está vacío.");
            return;
        }

        // 2. Mostramos su correo en la alerta
        alert(`¡Pedido confirmado!\n\nSe ha enviado un correo de confirmación a: ${usuarioGuardado.email}\nTotal: ${total}`);

        vaciarCarrito();
        document.getElementById('modal-carrito').classList.remove('mostrar');
    });

    // 6. Botón Salir (Logout)
    const btnSalir = document.getElementById('btn-salir');
    if (btnSalir) {
        btnSalir.addEventListener('click', () => {
            // Borramos los datos de la sesión
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("usuario");

            // Opcional: ¿Quieres que se borre el carrito al salir?
            // Si sí, descomenta la siguiente línea:
            // localStorage.removeItem("carrito");

            alert("Has cerrado sesión correctamente.");
            window.location.href = "login.html";
        });
    }
    
    // 7. Menú Hamburguesa (Móvil)
    const btnMenu = document.getElementById('menu-toggle');
    const menuPrincipal = document.getElementById('menu-principal');

    if (btnMenu && menuPrincipal) {
        btnMenu.addEventListener('click', () => {
            // Ponemos o quitamos la clase 'activo' que cambia el display en CSS
            menuPrincipal.classList.toggle('activo'); 
        });
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", main);