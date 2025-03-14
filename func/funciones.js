function generarContrasenaSegura(longitud = 12) {
    const mayusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const minusculas = "abcdefghijklmnopqrstuvwxyz";
    const numeros = "0123456789";
    const especiales = "*-#@!$%&?";

    // Al menos un carácter de cada tipo
    const unaMayuscula = mayusculas[Math.floor(Math.random() * mayusculas.length)];
    const unEspecial = especiales[Math.floor(Math.random() * especiales.length)];

    // Mezcla de caracteres para el resto de la contraseña
    let mezcla = mayusculas + minusculas + numeros + especiales;
    let contrasena = unaMayuscula + unEspecial;

    for (let i = 2; i < longitud; i++) {
        contrasena += mezcla[Math.floor(Math.random() * mezcla.length)];
    }

    // Mezclar los caracteres de la contraseña para mayor seguridad
    return contrasena.split("").sort(() => Math.random() - 0.5).join("");
}

// Exportar la función
module.exports = { generarContrasenaSegura };
