export default {
  Query: {
    averageHours: (_, { type }) => [
      {
        name: "funcionando",
        type,
        duration: 1,
        formattedDuration: "1",
      },
      {
        name: "sfd",
        type,
        duration: 1,
        formattedDuration: "1",
      },
    ],
  },
};
