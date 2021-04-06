import { EventModel } from "../../../models";

export default {
  Event: {
    duration: ({startDate, endDate}) => {
        const dur = endDate - startDate;
        return (dur);
    }
  },

  Query: {
    events: () => EventModel.find(),
  },

  Mutation: {
    createEvent: async (_, { data }) => EventModel.create(data),
    deleteEvent: async (_, { eventId }) =>
      EventModel.findByIdAndDelete(eventId),
  },
};
