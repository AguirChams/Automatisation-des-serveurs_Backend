const User = require("../models/User");

module.exports = {
  getEventAttendees: async (owner, isShared, attendees) => {
    const attendeesArray = [owner];
    if (isShared) {
      const attendeesToAdd = attendees.split(",");
      for (let attendee of attendeesToAdd) {
        const user = await User.findOne({ userName: attendee });
        if (!user)
          throw new Error(`Listed attendee ${attendee} does not exist`);
        const attendingUser = { userName: user.userName, id: user._id };
        attendeesArray.push(attendingUser);
      }
    }
    return attendeesArray;
  },
  removeAttendeeFromEvent: (attendeeToDelete, event) => {
    const newAttendees = event.attendees.filter(
      attendee => attendee.userName !== attendeeToDelete
    );

    let shared = true;

    if (newAttendees.length <= 1) shared = false;

    const updatedEventData = {
      attendees: newAttendees,
      shared
    };

    return updatedEventData;
  }
};