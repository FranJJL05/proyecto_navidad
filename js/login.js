import { get } from "./httpClient.js";

// Variables para el captcha matemático
let num1, num2;

document.addEventListener("DOMContentLoaded", () => {
    generarCaptcha();
    
    const formulario = document.getElementById("form-login");
    formulario.addEventListener("submit", validarLogin);
});

// Requisito 2: Seguridad anti-bot (Generación)
function generarCaptcha() {
    num1 = Math.floor(Math.random() * 10);
    num2 = Math.floor(Math.random() * 10);
    
    const labelCaptcha = document.getElementById("captcha-pregunta");
    labelCaptcha.innerText = `Seguridad: ¿Cuánto es ${num1} + ${num2}?`;
}

// Función principal de validación
async function validarLogin(event) {
    event.preventDefault(); // Evita que la página se recargue

    // 1. Validar Captcha (Anti-bot)
    const respuestaUsuario = parseInt(document.getElementById("captcha-input").value);
    if (respuestaUsuario !== (num1 + num2)) {
        alert("Error de seguridad: La suma es incorrecta. ¿Eres un robot?");
        generarCaptcha(); // Regenerar para evitar fuerza bruta
        return;
    }

    const email = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    // 2. Login contra Json Server (Requisito 1)
    // Nota: Para probar esto necesitas correr: json-server --watch db.json
    try {
        const usuarios = await get("http://localhost:3000/users");
        
        // Buscamos si existe el usuario con esa contraseña
        const usuarioEncontrado = usuarios.find(u => u.email === email && u.password === password);

        if (usuarioEncontrado) {
            // 3. Simulación Token JWT (Requisito 3)
            // Guardamos el objeto usuario y el token falso en sessionStorage
            sessionStorage.setItem("token", usuarioEncontrado.token);
            sessionStorage.setItem("usuario", JSON.stringify(usuarioEncontrado));
            
            alert(`Bienvenido de nuevo, ${usuarioEncontrado.name}`);
            window.location.href = "index.html";
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    } catch (error) {
        alert("Error de conexión con el servidor de usuarios (Json Server).");
        console.error(error);
    }
}