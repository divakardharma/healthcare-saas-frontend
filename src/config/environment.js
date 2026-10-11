const environment = {
  API_PATH:
    process.env.REACT_APP_API_PATH ||
    `${window.location.protocol}//${window.location.hostname}/healthcare-api/backend/public`,
};

export default environment;