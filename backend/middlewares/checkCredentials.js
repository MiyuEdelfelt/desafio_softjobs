export const checkCredentials = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Faltan credenciales: email o password" });
    }

    next();
};
