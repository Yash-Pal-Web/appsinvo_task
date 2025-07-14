const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const haversine = require('haversine-distance');

// Register User
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, latitude, longitude } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status_code: 400,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      address,
      latitude,
      longitude
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, latitude: user.latitude, longitude: user.longitude },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      status_code: 200,
      message: "User created successfully",
      data: {
        name: user.name,
        email: user.email,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
        status: user.status,
        register_at: user.register_at,
        token
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status_code: 500,
      message: "Internal server error"
    });
  }
};

// Change User Status
const toggleStatus = async (req, res) => {
  try {
     
    await User.updateMany(
      {},
      [{
        $set: {
          status: {
            $cond: {
              if: { $eq: ["$status", "active"] },
              then: "inactive",
              else: "active"
            }
          }
        }
      }]
    );



    res.status(200).json({
      status_code: 200,
      message: "All user statuses toggled"
      
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status_code: 500,
      message: "Internal server error"
    });
  }
};

// Get Distance
const getDistance = async (req, res) => {
  try {
    const userLat = req.user.latitude;
    const userLon = req.user.longitude;

    // Get query params
    const destLat = req.query.destination_latitude;
    const destLon = req.query.destination_longitude;

    // Validate presence
    if (!destLat || !destLon) {
      return res.status(400).json({
        status_code: 400,
        message: "Please provide both destination_latitude and destination_longitude in query params"
      });
    }

    // Validate if they are valid numbers
    const parsedDestLat = parseFloat(destLat);
    const parsedDestLon = parseFloat(destLon);

    if (isNaN(parsedDestLat) || isNaN(parsedDestLon)) {
      return res.status(400).json({
        status_code: 400,
        message: "destination_latitude and destination_longitude must be valid numbers"
      });
    }

    const dist = haversine(
      { lat: userLat, lon: userLon },
      { lat: parsedDestLat, lon: parsedDestLon }
    );

    res.status(200).json({
      status_code: 200,
      message: "Distance calculated",
      distance: `${(dist / 1000).toFixed(2)} km`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status_code: 500,
      message: "Internal server error"
    });
  }
};

// Get User Listing by Day
const getUserListing = async (req, res) => {
  try {
    const { week_number } = req.query;

    if (!week_number || week_number.trim() === "") {
      return res.status(400).json({
        status_code: 400,
        message: "Please provide the 'week_number' query parameter. Example: ?week_number=0,1,2"
      });
    }

    const days = week_number.split(',').map(Number);

    //  Validate numbers and range (0–6)
    if (days.some(day => isNaN(day) || day < 0 || day > 6)) {
      return res.status(400).json({
        status_code: 400,
        message: "All values in 'week_number' must be valid numbers between 0 and 6 (0=Sunday, 6=Saturday)."
      });
    }

    const pipeline = [
      {
        $project: {
          name: 1,
          email: 1,
          dayOfWeek: { $dayOfWeek: "$register_at" }
        }
      },
      {
        $match: {
          dayOfWeek: { $in: days.map(d => (d === 0 ? 1 : d + 1)) }
        }
      },
      {
        $group: {
          _id: "$dayOfWeek",
          users: { $push: { name: "$name", email: "$email" } }
        }
      }
    ];

    const data = await User.aggregate(pipeline);

    const result = {};
    data.forEach(item => {
      const day = item._id - 1;
      const dayName = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'
      ][day];
      result[dayName] = item.users;
    });

    res.status(200).json({
      status_code: 200,
      message: "User listing by day",
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status_code: 500,
      message: "Internal server error"
    });
  }
};



module.exports = {
  createUser,
  toggleStatus,
  getDistance,
  getUserListing
};
