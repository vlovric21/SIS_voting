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
        console.log(payload);
        req.user = {
            korime: payload.given_name + payload.family_name[0],
            id: userid,
            email: payload.email,
        };

        next(); // Proceed to the next middleware function or route handler
    } catch (error) {
        res.status(401).send('Invalid token');
    }
}