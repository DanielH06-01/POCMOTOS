const OpenAI = require('openai');
const detenv = require('dotenv').config();

// El cliente busca automáticamente la variable process.env.OPENAI_API_KEY
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function ejecutar() {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Usa el modelo acorde a tus necesidades
            messages: [
                { role: 'system', content: 'Eres un asistente conciso.' },
                { role: 'user', content: 'Cuanto da 1+1' }
            ],
            temperature: 0.7,
        });

        console.log(response.choices[0].message.content);
    } catch (error) {
        console.error('Error al llamar a la API:', error.message);
    }
}

ejecutar();
module.exports = openai