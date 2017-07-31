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
   * @param url MAGICApp url (obsolete soon)
   */
  constructor(username, password, url = 'https://www.magicapp.org:443/api/v1/') {
    this.username = username;
    this.password = password;
    this.jar = request.jar();
    this.url = url;
  };

  /**
   * Gets the XSRF cookie and saves it to the class' cookie jar
   * @returns {Promise.<void>}
   */
  async getXSRF() {
    await request({
      uri: 'https://www.magicapp.org/authenticate',
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
      uri: 'https://www.magicapp.org/authenticate',
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

  /**
   * A Helper to get all DEO specific fields from a guideline
   * @param guidelineShortName
   * @param user
   * @param pass
   * @returns {Promise.<{}>}
   */
  static async getFields(guidelineShortName, user = process.env.MAGIC_USER, pass = process.env.MAGIC_PASS) {
    let magicFields = {};

    // Init the MagicAppImport class
    let magicApp = new MagicAppImport(user, pass);

    // Do the authentication and wait for it
    await magicApp.authenticate();

    // Get the latest published guideline by short name
    magicFields.guideline = await magicApp.getLatestGuidelineByShortname(guidelineShortName);

    // Get all Picos from the guideline
    magicFields.guideline.picos = await magicApp.getPicosByGuidelineId(magicFields.guideline.guidelineId);

    // Get all Pico codes from the Pico
    for(let pico of magicFields.guideline.picos) {
      pico.codes = await magicApp.getPicoCodesByPicoId(pico.picoId)
    }

    return magicFields;
  }

};
