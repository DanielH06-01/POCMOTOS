document.getElementById('form-chat-ia').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pregunta = document.getElementById('preguntaIa').value;
    const respuestaPre = document.getElementById('respuestaIa');
    respuestaPre.textContent = 'Cargando...';

    try {
        // URL del backend (ajústala si tu servidor corre en otro puerto)
        const res = await fetch('http://localhost:3000/mensajeIa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pregunta })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `Error HTTP: ${res.status}`);
        }

        const data = await res.json();
        const textoRespuesta = data.respuesta;

        // Intentar parsear como JSON para detectar acción CRUD
        try {
            const jsonData = JSON.parse(textoRespuesta);
            // Validamos que tenga la estructura esperada para un formulario
            if (jsonData.accion && jsonData.formulario && Array.isArray(jsonData.formulario.campos)) {
                mostrarFormulario(jsonData);
                respuestaPre.textContent = 'Formulario generado, complétalo abajo.';
                return;
            }
        } catch (e) {
            // No es JSON o no tiene la estructura correcta, se tratará como texto normal
            console.log('La respuesta no es un JSON de acción, se muestra como texto.');
        }

        // Mostrar respuesta normal
        respuestaPre.textContent = textoRespuesta;
    } catch (error) {
        console.error('Error detallado:', error);
        respuestaPre.textContent = `Error: ${error.message}`;
    }
});

function mostrarFormulario(data) {
    const contenedor = document.getElementById('formulario-dinamico');
    contenedor.innerHTML = '';

    const titulo = document.createElement('h3');
    titulo.textContent = data.formulario.titulo;
    contenedor.appendChild(titulo);

    const form = document.createElement('form');
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '10px';
    form.style.marginTop = '15px';

    const campos = data.formulario.campos;
    campos.forEach(campo => {
        const label = document.createElement('label');
        label.textContent = campo + ':';
        const input = document.createElement('input');
        input.type = 'text';
        input.name = campo;
        input.required = true;
        form.appendChild(label);
        form.appendChild(input);
    });

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Enviar';
    submitBtn.style.background = '#e94560';
    submitBtn.style.color = 'white';
    submitBtn.style.border = 'none';
    submitBtn.style.padding = '10px';
    submitBtn.style.borderRadius = '8px';
    submitBtn.style.cursor = 'pointer';
    form.appendChild(submitBtn);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const datos = {};
        for (let [key, value] of formData.entries()) {
            datos[key] = value;
        }

        const endpoints = {
            crearRepuesto: '/agregarRepuesto',
            crearMecanico: '/mecanicos',
            actualizarRepuesto: '/actualizarRepuesto',
            actualizarMecanico: '/actualizarMecanico',
            eliminarRepuesto: '/eliminarRepuesto',
            eliminarMecanico: '/eliminarMecanico'
        };
        const endpoint = endpoints[data.accion];

        if (!endpoint) {
            alert('Acción no soportada');
            return;
        }

        try {
            const res = await fetch('http://localhost:3000' + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const result = await res.json();
            alert(JSON.stringify(result, null, 2));
            contenedor.innerHTML = '';
        } catch (error) {
            alert('Error al enviar el formulario');
        }
    });

    contenedor.appendChild(form);
}