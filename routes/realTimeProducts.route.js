import { Router } from "express";

const router =  Router()

// Ruta para la vista en tiempo real
router.get('/', (req, res) => {
    res.render('realTimeProducts');
});

export default router;