import mongoose from "mongoose";

const CalendarSchema = new mongoose.Schema({
});

const CalendarModel = mongoose.model("Calendar", CalendarSchema);

export default CalendarModel;   
