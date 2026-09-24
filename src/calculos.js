const calculoRepuestos = (TotalR) => {
    let iterando = 0
    for (const itera of TotalR) {
        iterando += itera["precio"]
    }
    return iterando;
}

//VHM valor hora mecanico, th 
const tarifaTotal = (vhm, th, cr) => {
    return (vhm * th) + cr
}

const suma = (a, b) => {
    return a + b
}



const calcularReparacion = (
    mecanicos, repuestos, nombreMecanico, modelo, nombreRepuesto, horas
) => {
    const mecanico = mecanicos.find(
        (m) => m.nombre.toLowerCase() ===
            nombreMecanico.toLowerCase()
    );
    // Buscar repuesto
    const repuesto = repuestos.find(
        (r) =>
            r.nombre.toLowerCase() ===
            nombreRepuesto.toLowerCase() &&
            r.modelo.toLowerCase() ===
            modelo.toLowerCase()
    );
    // Validar mecánico
    if (!mecanico) {
        throw new Error("Mecánico no encontrado");
    }
    // Validar repuesto
    if (!repuesto) {
        throw new Error("Repuesto o modelo no encontrado");
    }
    // Precio del mecánico
    const precioMecanico =
        mecanico.precio * horas;
    // Precio total
    const total =
        precioMecanico + repuesto.precio;
    return {
        mecanico: mecanico.nombre,
        modelo: repuesto.modelo,
        repuesto: repuesto.nombre,
        precioHoraMecanico: mecanico.precio,
        horas: horas,
        precioMecanico: precioMecanico,
        precioRepuesto: repuesto.precio,
        total: total
    };
};
module.exports = {
    calculoRepuestos,
    tarifaTotal,
    suma,
    calcularReparacion
}