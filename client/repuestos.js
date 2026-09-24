document.getElementById("formRepuestos").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoRepuesto = {
        Modelo: document.getElementById("modelo").value,
        repuestos: document.getElementById("nombreRepuesto").value,
        precio: parseFloat(document.getElementById("precio").value)
    };

    try {
        const response = await fetch("http://localhost:3000/agregarRepuesto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoRepuesto)
        });
        const data = await response.json();

        // Mostrar mensaje y detalle
        document.getElementById("mensaje").textContent = data.mensaje || "Error al agregar";

        const detalle = document.createElement("pre");
        detalle.textContent = JSON.stringify(data.repuesto || data, null, 2);
        document.getElementById("mensaje").appendChild(detalle);
    } catch (error) {
        console.error(error);
        document.getElementById("mensaje").textContent = "Error en la conexión";
    }
});