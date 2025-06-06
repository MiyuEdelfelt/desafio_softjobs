import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ error: "Token no enviado" });

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.email = decoded.email; // lo pasamos al req para usarlo después
        next();
    } catch (error) {
        res.status(401).json({ error: "Token inválido", detalle: error.message });
    }
};
