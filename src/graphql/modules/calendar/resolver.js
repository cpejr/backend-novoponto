import CalendarModel from "../../../models/Calendar";
const resolvers = {
    Query: {
      calendar: async () => {
        return await CalendarModel.find();
      },
    },
    Mutation: {
      createCalendar: async (_, { archive}) => {
        console.log(archive)  
        return null;
      },
      deleteCalendar: async (_, { _id }) =>{
        await CalendarModel.findByIdAndDelete({ _id })
      },
    },
  };
  
  export default resolvers;
  