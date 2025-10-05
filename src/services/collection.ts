export const collectionSchema = {
  barbers: {
    name: "barbers",
    subCollections: {
      clients: {
        name: "clients",
      },
      appointments: {
        name: "appointments",
      },
    },
  },
};
