# magicapp-client
*MAGICapp API client for Javascript*

This client package handles the authentication and requests to MAGICapp API (http://magicproject.org/). It has a few built-in API methods, but you can do raw requests as well (see below).
The final goal is to have all request methods built-in. Feel free to contribute with pull requests.


```javascript
// Require the magicapp-client package
const MagicAppImport = require('magicapp-client');

// Init the magicFields object
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

// Print out the JSON data
console.log(magicFields);

```

Do a raw API request
```javascript
// Require the magicapp-client package
const MagicAppImport = require('magicapp-client');

// Init the MagicAppImport class
let magicApp = new MagicAppImport(user, pass);

// Authenticate
await magicApp.authenticate();

// Do the raw request
let guidelines = await magicApp.getRaw('guidelines?mine=1');

// Print out the data
console.log(guidelines);
```
