const mongoose = require('mongoose');

const meetingHistory = new mongoose.Schema({
    agenda: { type: String, required: true },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
    }],
    leadAttendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
    }],
    location: String,
    related: String,
    dateTime: { type: Date, required: true },
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
});

meetingHistory.index({ createdBy: 1 });
meetingHistory.index({ dateTime: -1 });

module.exports = mongoose.model('Meetings', meetingHistory, 'Meetings');
