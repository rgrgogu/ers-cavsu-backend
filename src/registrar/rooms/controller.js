const Room = require('./model');

const RoomController = {
    // Get all rooms
    async getAll(req, res) {
        try {
            const rooms = await Room.find()
                .populate('created_by', 'name')
                .populate('updated_by', 'name')

            res.json(rooms);
        } catch (error) {
            res.status(400).json({ error: 'Failed to fetch rooms' });
        }
    },

    // Get a single room by ID
    async getById(req, res) {
        try {
            const room = await Room.findById(req.params.id);
            if (!room) return res.status(404).json({ error: 'Room not found' });
            res.json(room);
        } catch (error) {
            res.status(400).json({ error: 'Failed to fetch room' });
        }
    },

    // Create a new room
    async create(req, res) {
        try {
            const { name, created_by } = req.body;

            const newRoom = new Room({ name, created_by });
            const savedRoom = await newRoom.save();
            
            res.status(201).json(savedRoom);
        } catch (error) {
            res.status(400).json({ error: 'Failed to create room' });
        }
    },

    // Update a room
    async update(req, res) {
        try {
            const { name } = req.body;
            const updated_by = req.user?._id;

            const updatedRoom = await Room.findByIdAndUpdate(
                req.params.id,
                { name, updated_by },
                { new: true }
            );

            if (!updatedRoom) return res.status(404).json({ error: 'Room not found' });
            res.json(updatedRoom);
        } catch (error) {
            res.status(400).json({ error: 'Failed to update room' });
        }
    },

    // Delete a room
    async delete(req, res) {
        try {
            const deletedRoom = await Room.findByIdAndDelete(req.params.id);
            if (!deletedRoom) return res.status(404).json({ error: 'Room not found' });
            res.json({ message: 'Room deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: 'Failed to delete room' });
        }
    }
};

module.exports = RoomController;
