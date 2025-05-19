const Meeting = require("../../model/schema/meeting"); // Adjust path as needed

// GET /api/meeting
const index = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Invalid or missing user ID in token." });
    }

    const meetings = await Meeting.find({
      createdBy: userId,
      deleted: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({ meetings });
  } catch (err) {
    console.error("Meeting load failed:", err);
    res.status(500).json({
      status: 500,
      message: "Failed to load meetings",
      error: err.message,
    });
  }
};

// GET /api/meeting/view/:id
const view = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      deleted: false,
    });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found." });
    }
    res.status(200).json({ meeting });
  } catch (err) {
    console.error("View meeting failed:", err);
    res
      .status(500)
      .json({ message: "Failed to view meeting", error: err.message });
  }
};

// POST /api/meeting
const add = async (req, res) => {
  try {
    const {
      agenda,
      attendees,
      leadAttendees,
      location,
      related,
      dateTime,
      notes,
    } = req.body;

    const createdBy = req.user?.userId;

    if (!createdBy) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing user ID." });
    }

    const meeting = new Meeting({
      agenda,
      attendees,
      leadAttendees,
      location,
      related,
      dateTime,
      notes,
      createdBy,
      deleted: false,
    });

    await meeting.save();

    res.status(201).json({ message: "Meeting created successfully", meeting });
  } catch (err) {
    console.error("Add meeting failed:", err);
    res.status(500).json({
      message: "Failed to create meeting",
      error: err.message,
    });
  }
};

// DELETE /api/meeting/delete/:id
const deleteData = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    meeting.deleted = true;
    await meeting.save();

    res.status(200).json({ message: "Meeting deleted" });
  } catch (err) {
    console.error("Delete meeting failed:", err);
    res
      .status(500)
      .json({ message: "Failed to delete meeting", error: err.message });
  }
};

// POST /api/meeting/deleteMany
const deleteMany = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid meeting IDs provided." });
    }

    await Meeting.updateMany(
      { _id: { $in: ids } },
      { $set: { deleted: true } }
    );

    res.status(200).json({ message: "Meetings deleted successfully" });
  } catch (err) {
    console.error("Delete many meetings failed:", err);
    res
      .status(500)
      .json({ message: "Failed to delete meetings", error: err.message });
  }
};

module.exports = {
  index,
  view,
  add,
  deleteData,
  deleteMany,
};
