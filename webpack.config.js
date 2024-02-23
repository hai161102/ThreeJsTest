module.exports = config => {
    config.module.rules.forEach(item => {
      if (item.loader && item.loader.indexOf('url-loader') > -1) {
        item.exclude.push(/\.mjs$/);
      }
    });
    return config;
  };