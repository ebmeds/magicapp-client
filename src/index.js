const request = require('request-promise-native');
const URL = require('url');

/**
 * Class for importing data from MAGICApp
 */
module.exports = class MagicAppImport {

  /**
   * Constructor
   * Use the regular username and password for MAGICApp
   * @param username MAGICApp username
   * @param password MAGICApp password
   * @param url MAGICApp url
   * @param authUrl MAGICApp authentication url
   */
  constructor(username, password, url = 'https://api.magicapp.org/api/v1/', authUrl = 'https://api.magicapp.org/authenticate') {
    this.username = username;
    this.password = password;
    this.jar = request.jar();
    this.url = url;
    this.authUrl = authUrl;
  };

  /**
   * Gets the XSRF cookie and saves it to the class' cookie jar
   * @returns {Promise.<void>}
   */
  async getXSRF() {
    await request({
      uri: this.authUrl,
      jar: this.jar,
      method: 'OPTIONS'
    });
  };

  /**
   * Does the authentication using the XSRF token and the username and password
   * @returns {Promise.<void>}
   */
  async authenticate() {

    // Get the XSRF cookie
    await this.getXSRF();

    // Get cookie data from the jar
    let cookies = this.jar.getCookies(this.url);

    // Throw an error if can't get a XSRF cookie
    if(cookies.length < 1) {
      throw new Error('Could not get a XSRF cookie from ' + this.url)
    }

    let xsrf = cookies[0].toJSON();

    // Do the actual authentication and get the session cookie
    await request({
      uri: this.authUrl,
      method: 'POST',
      jar: this.jar,
      headers: {
        'X-XSRF-TOKEN': xsrf.value
      },
      formData: {
        username: this.username,
        password: this.password
      }
    });
  };

  /**
   * Get raw API request
   * @param path
   * @returns {Promise.<*>}
   */
  async getRaw(path) {

    let url = URL.resolve(this.url, path);

    let options = {
      uri: url,
      json: true,
      jar: this.jar
    };
    return await request(options);
  }

  /**
   * Get Guidelines
   * @returns {Promise.<*>}
   */
  async getGuideLines() {
      return await this.getRaw('guidelines?mine=1');
  }

  /**
   * Get latest published guideline by shortname
   * @param shortname
   * @returns {Promise.<*>}
   */
  async getLatestGuidelineByShortname(shortname) {
    return await this.getRaw(`guidelines/published/${shortname}`);
  }

  /**
   * Get PICOs by Guideline ID
   * @param id
   * @returns {Promise.<*>}
   */
  async getPicosByGuidelineId(id) {
    return await this.getRaw(`guidelines/${id}/picos`);
  }

  /**
   * Get PICO by PICO id
   * @param id
   * @returns {Promise.<*>}`
   */
  async getPicoCodesByPicoId(id) {
    return await this.getRaw(`picos/${id}/codes`);
  }
};
