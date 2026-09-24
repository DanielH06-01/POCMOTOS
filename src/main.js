const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const z = require("zod");
const { suma, tarifaTotal, calculoRepuestos } = require("./calculos");
const fs = require("fs");
const path = require("path");
const openai = require('./openai')

//Conexion Api


// Rutas correctas a los JSON (datos está dentro de src)
const mecanicos = require("./datos/data.json");
const repuestos = require("./datos/repuestos.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ... (resto de rutas)

// Ruta POST correcta para agregar repuesto
app.post("/agregarRepuesto", (req, res) => {
    try {
        const { Modelo, repuestos, precio } = req.body
        if (!Modelo || !repuestos || !precio) {
            return res.status(400).json({ error: 'Faltan datos del Repuesto' })
        }
        const rutaRepuesto = path.join(__dirname, './datos/repuestos.json')
        const listaRepuesto = JSON.parse(fs.readFileSync(rutaRepuesto, 'utf-8'))
        const nuevoRepuesto = {
            Modelo: Modelo,
            repuestos: repuestos,
            precio: Number(precio)
        }
        listaRepuesto.push(nuevoRepuesto)
        fs.writeFileSync(rutaRepuesto, JSON.stringify(listaRepuesto, null, 2))
        res.status(200).json({ mensaje: 'Nuevo producto añadido', Repuesto: nuevoRepuesto })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error en el sistema' })
    }
});

app.post("/mecanicos", (req, res) => {

    let {
        name,
        level,
        price_hour
    } = req.body;

    const nuevoMecanico = {
        name: name,
        level: level,
        price_hour: Number(price_hour)
    };

    mecanicos.push(nuevoMecanico);

    // Ruta corregida usando __dirname
    fs.writeFileSync(
        path.join(__dirname, "./datos/data.json"),
        JSON.stringify(mecanicos, null, 4)
    );

    res.json({
        ms: "Mecánico registrado",
        mecanico: nuevoMecanico
    });

});

app.get("/calculoTarifa/:mecanico", (req, res) => {
    const index = parseInt(req.params.mecanico, 10)
    const mecanico = mecanicos[index]

    if (!mecanico) {
        return res.status(404).json({ Error: "mecanico no encontrado" })
    }
    const total = calculoRepuestos(repuestos)
    const vhm = mecanico.price_hour;
    const final = tarifaTotal(vhm, 2.5, total)
    res.json({
        "ms": "Resultado del calculo",
        "mecanico": mecanico,
        "res": final
    })
})

app.get("/mensaje/:nombre", (req, res) => {
    const nombre = req.params.nombre
    res.json({
        mensaje: `Hola, ${nombre}`
    })
})

app.post("/calcular", (req, res) => {

    try {

        const {
            mecanico,
            modelo,
            repuesto,
            horas
        } = req.body;

        // Convertimos el mecánico recibido a número
        const indiceMecanico = parseInt(mecanico);

        // Buscamos el mecánico
        const mecanicoSeleccionado = mecanicos[indiceMecanico];

        if (!mecanicoSeleccionado) {

            return res.status(400).json({
                error: "Mecánico no encontrado"
            });

        }

        // Calculamos el valor de los repuestos
        const totalRepuestos = calculoRepuestos(repuestos);

        // Si no mandan horas usamos 2.5
        const horasTrabajo = horas || 2.5;

        // Calculamos el total
        const total = tarifaTotal(
            mecanicoSeleccionado.price_hour,
            horasTrabajo,
            totalRepuestos
        );

        // Mostramos el resultado
        res.json({

            ms: "Resultado del cálculo",

            mecanico: mecanicoSeleccionado,

            modelo: modelo,

            repuesto: repuesto,

            horas: horasTrabajo,

            precioRepuestos: totalRepuestos,

            total: total

        });

    } catch (error) {

        res.status(400).json({
            error: error.message
        });

    }

});

// Actualizar repuesto
app.post('/actualizarRepuesto', (req, res) => {
    try {
        const { Modelo, repuestos, precio } = req.body;
        if (!Modelo) return res.status(400).json({ error: 'Se requiere Modelo para actualizar' });

        const rutaRepuesto = path.join(__dirname, './datos/repuestos.json');
        let lista = JSON.parse(fs.readFileSync(rutaRepuesto, 'utf-8'));

        const index = lista.findIndex(item => item.Modelo === Modelo);
        if (index === -1) return res.status(404).json({ error: 'Repuesto no encontrado' });

        // Actualizar campos si vienen en el body
        if (repuestos) lista[index].repuestos = repuestos;
        if (precio) lista[index].precio = Number(precio);

        fs.writeFileSync(rutaRepuesto, JSON.stringify(lista, null, 2));
        res.json({ mensaje: 'Repuesto actualizado', repuesto: lista[index] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al actualizar repuesto' });
    }
});

// Eliminar repuesto
app.post('/eliminarRepuesto', (req, res) => {
    try {
        const { Modelo } = req.body;
        if (!Modelo) return res.status(400).json({ error: 'Se requiere Modelo para eliminar' });

        const rutaRepuesto = path.join(__dirname, './datos/repuestos.json');
        let lista = JSON.parse(fs.readFileSync(rutaRepuesto, 'utf-8'));

        const nuevaLista = lista.filter(item => item.Modelo !== Modelo);
        if (nuevaLista.length === lista.length) return res.status(404).json({ error: 'Repuesto no encontrado' });

        fs.writeFileSync(rutaRepuesto, JSON.stringify(nuevaLista, null, 2));
        res.json({ mensaje: 'Repuesto eliminado correctamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al eliminar repuesto' });
    }
});

// Actualizar mecánico
app.post('/actualizarMecanico', (req, res) => {
    try {
        const { name, level, price_hour } = req.body;
        if (!name) return res.status(400).json({ error: 'Se requiere name para actualizar' });

        const rutaMecanico = path.join(__dirname, './datos/data.json');
        let lista = JSON.parse(fs.readFileSync(rutaMecanico, 'utf-8'));

        const index = lista.findIndex(item => item.name === name);
        if (index === -1) return res.status(404).json({ error: 'Mecánico no encontrado' });

        if (level) lista[index].level = level;
        if (price_hour) lista[index].price_hour = Number(price_hour);

        fs.writeFileSync(rutaMecanico, JSON.stringify(lista, null, 4));
        res.json({ mensaje: 'Mecánico actualizado', mecanico: lista[index] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al actualizar mecánico' });
    }
});

// Eliminar mecánico
app.post('/eliminarMecanico', (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Se requiere name para eliminar' });

        const rutaMecanico = path.join(__dirname, './datos/data.json');
        let lista = JSON.parse(fs.readFileSync(rutaMecanico, 'utf-8'));

        const nuevaLista = lista.filter(item => item.name !== name);
        if (nuevaLista.length === lista.length) return res.status(404).json({ error: 'Mecánico no encontrado' });

        fs.writeFileSync(rutaMecanico, JSON.stringify(nuevaLista, null, 4));
        res.json({ mensaje: 'Mecánico eliminado correctamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al eliminar mecánico' });
    }
});

app.post('/mensajeIa', async (req, res) => {
    try {
        // Capturamos la pregunta enviada por el Frontend
        const { pregunta } = req.body;

        if (!pregunta) {
            return res.status(400).json({ error: 'La pregunta es requerida' });
        }

        // Consultamos a OpenAI enviándole tus archivos JSON como "contexto" de conocimiento
        const respuestaIa = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Eres un asistente virtual para OPCMOTOS, un taller de motos. Tu trabajo es ayudar en lo que sea: ventas, soporte, preguntas técnicas, e incluso realizar operaciones CRUD en la base de datos (crear, actualizar o eliminar repuestos y mecánicos) si el usuario lo pide explícitamente.

**Estilo de respuesta:**
- Sé breve y conciso (máximo 2-3 frases si es posible).
- Usa un tono amigable y servicial.
- Si no sabes algo, dilo con honestidad y ofrece ayuda en lo que sí puedes.

**Datos actuales del taller:**
- Mecánicos: ${JSON.stringify(mecanicos)}
- Repuestos: ${JSON.stringify(repuestos)}

**Operaciones CRUD (solo cuando el usuario lo pida claramente):**
Si el usuario dice algo como "agregar", "crear", "eliminar", "borrar", "actualizar", "modificar" seguido de un repuesto o mecánico, debes responder SOLO con un JSON en el formato exacto que se indica abajo. No agregues texto, markdown ni explicaciones.

Formatos:
- Crear repuesto: {"accion":"crearRepuesto","formulario":{"titulo":"Agregar Repuesto","campos":["Modelo","repuestos","precio"]}}
- Crear mecánico: {"accion":"crearMecanico","formulario":{"titulo":"Agregar Mecánico","campos":["name","level","price_hour"]}}
- Actualizar repuesto: {"accion":"actualizarRepuesto","formulario":{"titulo":"Actualizar Repuesto","campos":["Modelo","repuestos","precio"]}}
- Actualizar mecánico: {"accion":"actualizarMecanico","formulario":{"titulo":"Actualizar Mecánico","campos":["name","level","price_hour"]}}
- Eliminar repuesto: {"accion":"eliminarRepuesto","formulario":{"titulo":"Eliminar Repuesto","campos":["Modelo"]}}
- Eliminar mecánico: {"accion":"eliminarMecanico","formulario":{"titulo":"Eliminar Mecánico","campos":["name"]}}

Para cualquier otra pregunta (precios, información general, saludos, etc.) responde con texto normal, sin JSON.`
                },
                { role: 'user', content: pregunta }
            ],
            temperature: 0.7,
        });

        // Devolvemos la respuesta procesada por el bot al Frontend
        return res.status(200).json({
            respuesta: respuestaIa.choices[0].message.content
        });

    } catch (error) {
        console.error('Error en el servidor:', error.message);
        return res.status(500).json({ error: 'Ha ocurrido un error al procesar tu consulta con la IA' });
    }
});

app.listen(PORT, () => {
    console.log("Estamos en linea en el puerto:http://localhost:3000")
})

module.exports = app;