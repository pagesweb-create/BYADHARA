// --- CONFIGURACIÓN DE SUPABASE ACTUALIZADA ---
const PROJECT_ID = 'uxbzdtjzzdmkxvttlybq';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;

// HE ACTUALIZADO ESTA LLAVE PARA QUE COINCIDA CON TU NUEVO PROJECT_ID
const SUPABASE_KEY = 'sb_publishable_L90j_PgzAhDen9Vw1XO28Q_uwMkgqsA'; 

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let productosDB = []; 
let carrito = [];

// --- CARGAR PRODUCTOS ---
async function obtenerProductos() {
    try {
        const { data, error } = await _supabase
            .from('productos') 
            .select('*');

        if (error) {
            console.error("Error en Supabase:", error.message);
            return;
        }

        if (data) {
            productosDB = data;
            mostrarProductos(data);
        }
    } catch (err) {
        console.error("Error de conexión:", err);
    }
}

function mostrarProductos(lista) {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;
    
    contenedor.innerHTML = "";

    lista.forEach(p => {
        // Validación de campos para evitar errores si falta un dato en la fila
        const nombre = p.nombre || "Producto sin nombre";
        const precio = p.precio || 0;
        const imagen = p['imagen url'] || 'https://via.placeholder.com/300';
        const tallasTexto = p['tallas'] || "S, M, L, XL";
        const listaTallas = tallasTexto.split(',');

        let selectTallas = `<select id="talla-${p.id}" class="talla-selector">`;
        listaTallas.forEach(t => {
            selectTallas += `<option value="${t.trim()}">Talla: ${t.trim()}</option>`;
        });
        selectTallas += `</select>`;

        contenedor.innerHTML += `
            <div class="card">
                <img src="${imagen}" alt="${nombre}">
                <h4 style="margin: 10px 0; font-size: 14px; color: #333;">${nombre}</h4>
                <p style="color: #ffb6c1; font-weight: bold; font-size: 16px;">$${precio.toLocaleString()}</p>
                ${selectTallas}
                <button class="btn-comprar" onclick="agregarAlCarrito(${p.id})">Añadir al Carrito</button>
            </div>
        `;
    });
}

// --- BÚSQUEDA Y FILTROS ---
function filtrar(cat) {
    toggleMenu();
    const titulo = document.getElementById('titulo-categoria');
    if(titulo) titulo.innerText = cat === 'todos' ? 'Nuestra Colección' : cat;
    
    if (cat === 'todos') {
        mostrarProductos(productosDB);
    } else {
        const filtrados = productosDB.filter(p => p.categoria?.toLowerCase() === cat.toLowerCase());
        mostrarProductos(filtrados);
    }
}

function buscarProductos() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    const filtrados = productosDB.filter(p => p.nombre.toLowerCase().includes(texto));
    mostrarProductos(filtrados);
}

// --- CARRITO ---
function agregarAlCarrito(id) {
    const producto = productosDB.find(p => p.id === id);
    const selectorTalla = document.getElementById(`talla-${id}`);
    const tallaSeleccionada = selectorTalla ? selectorTalla.value : "Única";
    
    const item = {
        ...producto,
        tallaElegida: tallaSeleccionada,
        tempId: Date.now()
    };

    carrito.push(item);
    actualizarCarritoUI();
    
    const burbuja = document.getElementById('cart-burbuja');
    if(burbuja) {
        burbuja.style.transform = "scale(1.2)";
        setTimeout(() => burbuja.style.transform = "scale(1)", 200);
    }
}

function actualizarCarritoUI() {
    const lista = document.getElementById('items-carrito');
    const totalElemento = document.getElementById('total-precio');
    const cuentaBurbuja = document.getElementById('cuenta-carrito');
    
    if(!lista || !totalElemento || !cuentaBurbuja) return;

    lista.innerHTML = "";
    let total = 0;

    carrito.forEach(item => {
        total += item.precio;
        lista.innerHTML += `
            <div class="item-carrito">
                <img src="${item['imagen url']}" class="img-carrito">
                <div style="flex-grow:1">
                    <p style="font-size: 12px; font-weight: bold;">${item.nombre}</p>
                    <p style="font-size: 11px; color: #ffb6c1;">Talla: ${item.tallaElegida} - $${item.precio.toLocaleString()}</p>
                </div>
                <button class="btn-quitar" onclick="quitarDelCarrito(${item.tempId})">✕</button>
            </div>
        `;
    });

    totalElemento.innerText = total.toLocaleString();
    cuentaBurbuja.innerText = carrito.length;
}

function quitarDelCarrito(tempId) {
    carrito = carrito.filter(item => item.tempId !== tempId);
    actualizarCarritoUI();
}

// --- MENÚS ---
function toggleMenu() {
    const menu = document.getElementById('menu-sidebar');
    if(menu) menu.classList.toggle('menu-hidden');
}

function toggleCarrito() {
    const carritoSide = document.getElementById('carrito-sidebar');
    if(carritoSide) carritoSide.classList.toggle('carrito-hidden');
}

// --- WHATSAPP ---
function enviarWhatsApp() {
    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    let mensaje = "¡Hola Adhara Store! ✨ Quisiera hacer un pedido:\n\n";
    carrito.forEach(item => {
        mensaje += `• ${item.nombre} (Talla: ${item.tallaElegida}) - $${item.precio.toLocaleString()}\n`;
    });
    mensaje += `\n*Total: $${document.getElementById('total-precio').innerText}*`;

    const url = `https://wa.me/573173046223?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// Iniciar proceso
obtenerProductos();
