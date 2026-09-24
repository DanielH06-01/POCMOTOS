document.getElementById("formMecanico").addEventListener("submit", async (e) => {
    e.preventDefault();

    const mecanico = {
        name: document.getElementById("name").value,
        level: document.getElementById("level").value,
        price_hour: Number(document.getElementById("price_hour").value)
    };

    try {
        const respuesta = await fetch("http://localhost:3000/mecanicos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(mecanico)
        });

        const datos = await respuesta.json();
        document.getElementById("resultado").textContent = JSON.stringify(datos, null, 2);
    } catch (error) {
        console.error(error);
        document.getElementById("resultado").textContent = "Error en la conexión";
    }
});