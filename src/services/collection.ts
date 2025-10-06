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
      employees: {
        name: "employees",
      },
    },
  },
  clients: {
    name: "clients",
    subCollections: {
      appointments: {
        name: "appointments",
      },
    },
  },
};
