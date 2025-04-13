const express = require('express');
const RoomController = require('./controller');

const router = express.Router();
const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get('/', RequireAuth, RoomController.getAll);
router.get('/:id', RequireAuth, RoomController.getById);
router.post('/', RequireAuth, RoomController.create);
router.put('/:id', RequireAuth, RoomController.update);
router.delete('/:id', RequireAuth, RoomController.delete);

module.exports = router;
