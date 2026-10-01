let accessToken = null;
let csrfToken = null;

const tokenService = {
  getAccessToken: () => accessToken,

  setAccessToken: (token) => {
    accessToken = token;
  },

  removeAccessToken: () => {
    accessToken = null;
  },

  getCsrfToken: () => csrfToken,

  setCsrfToken: (token) => {
    csrfToken = token;
  },

  removeCsrfToken: () => {
    csrfToken = null;
  },

  clearTokens: () => {
    accessToken = null;
    csrfToken = null;
  },
};

export default tokenService;