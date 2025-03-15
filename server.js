console.log("Iniciando servidor...");
console.log(process.env.STRIPE_SECRET_KEY);
console.log("Domain: " + process.env.RAILWAY_PRIVATE_DOMAIN);

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3020;

// Middleware para recibir Webhooks sin procesar (necesario para validar la firma)
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf.toString(); }}));

app.get('/', (req, res) => {
    res.send('Servidor de pagos de Stripe en Node.js');
});

// Ruta del Webhook de Stripe
app.post('/webhook-stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("❌ Error verificando la firma del Webhook:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Verificar si el evento es un pago exitoso
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const email = session.customer_details.email;
        const name = session.customer_details.name;
        //separar el nombre de los apellidos
        const nameSplit = name.split(' ');
        const lastName = nameSplit[nameSplit.length - 1];
        const firstName = nameSplit.slice(0, nameSplit.length - 1).join(' ');
        
        console.log(`✅ Pago recibido de ${email}. Creando usuario en Moodle`);

        try {

            const formData = new FormData();
            formData.append('moodlewsrestformat', 'json');
            formData.append('wsfunction', 'core_user_create_users');
            formData.append('wstoken', process.env.MOODLE_TOKEN);
            formData.append('users[0][username]', email.split('@')[0]);
            formData.append('users[0][firstname]', firstName ? firstName : 'Nuevo');
            formData.append('users[0][lastname]', lastName ? lastName : 'Usuario');
            formData.append('users[0][email]', email);
            formData.append('users[0][auth]', 'manual');
            formData.append('users[0][createpassword]', 1);
            
            // Enviar la solicitud a Moodle con FormData
            const moodleResponse = await axios.post(process.env.MOODLE_URL, formData, {
                headers: formData.getHeaders()
            });

            console.log("🟢 Usuario creado en Moodle:", moodleResponse.data);
        } catch (error) {
            console.error("❌ Error creando usuario en Moodle:", error.response ? error.response.data : error.message);
        }
    }

    res.status(200).send();
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
