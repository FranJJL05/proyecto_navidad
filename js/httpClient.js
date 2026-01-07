/**
 * Módulo para realizar peticiones HTTP
 * Se usa tanto para la FakeStoreAPI como para el Json-Server
 */

export async function get(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error obteniendo datos:", error);
        return null;
    }
}