export const queryKeys = {
  adminCustomers: {
    all: ['admin-customers'],
    list: (filters) => ['admin-customers', 'list', filters],
    detail: (id) => ['admin-customers', 'detail', id],
  },
  adminUsers: {
    all: ['adminUsersList'],
    list: (filters) => ['adminUsersList', filters],
    detail: (id) => ['adminUsersList', id],
  },
  adminOrders: {
    all: ['admin-orders'],
    list: (filters) => ['admin-orders', 'list', filters],
    detail: (id) => ['admin-orders', 'detail', id],
  },
};

export default queryKeys;
