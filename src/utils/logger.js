const env = import.meta.env

let Logger = {
  log(msg) {
    if (env.APP_MODE === 'develop') {
      console.log(JSON.stringify(msg));
    }
  },

  alert(msg) {
    if (env.APP_MODE === 'develop') {
      console.error(JSON.stringify(msg));
    }
  }
};

export default Logger;
