const { OAuth2Client } = require('google-auth-library');
const clientID = "438683151533-q7st5pdgcjnd756crf5bgssfiep18cjp.apps.googleusercontent.com";
const client = new OAuth2Client(clientID);


exports.verifyOpenIDToken = async function(req, res, next) {
    try {
        const token = req.body.token;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];

        // Add the user's information to the request object
        req.user = {
            id: userid,
            email: payload.email,
            name: payload.name,
            // Add other necessary information
        };

        next(); // Proceed to the next middleware function or route handler
    } catch (error) {
        // Handle the error (e.g., send a response with an error status code)
        res.status(401).send('Invalid token');
    }
}

// Use the middleware function in your routes
app.post('/api/register', verifyOpenIDToken, (req, res) => {
    // Registration logic here
    // You can access the user's information with `req.user`
});