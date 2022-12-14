const Room = require('../models/Room.js');
const User = require('../models/User');
const Hotel = require('../models/Hotel.js');
const moment = require('moment');
const { createError } = require('../utils/error.js');

const createRoom = async (req, res, next) => {
  const hotelId = req.params.hotelId;
  const newRoom = new Room({ hotelId: req.params.hotelId, ...req.body });

  try {
    const savedRoom = await newRoom.save();
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $push: { rooms: savedRoom._id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json(savedRoom);
  } catch (err) {
    next(err);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedRoom);
  } catch (err) {
    next(err);
  }
};

const deleteRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;
  try {
    await Room.findByIdAndDelete(req.params.id);
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $pull: { rooms: req.params.id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json('Room has been deleted.');
  } catch (err) {
    next(err);
  }
};
const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
};
const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};

const updateRoomAvailability = async (req, res, next) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, {
      $push: { unavailableDates: req.body.dates },
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        bookedRooms: {
          $each: [
            {
              room: req.body.room,
              dates: req.body.dates,
              paid: req.body.paid,
              reservedAt: moment.utc(req.body.reservedAt),
            },
          ],
          $position: 0,
        },
      },
    });

    res.status(200).json('Room status has been updated.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRoom,
  updateRoom,
  deleteRoom,
  getRoom,
  getRooms,
  updateRoomAvailability,
};
