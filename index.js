const express = require('express');
const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery();
const YAML = require('yamljs');
const queries = YAML.load("./queries.yaml");
var cors = require('cors')

// Create an Express object and routes (in order)
const app = express();

// Cors
app.use(cors());

// Normal endpoints
app.get('/spells/', spells);
app.get('/spells/:ids', spells);
app.get('/class_spells/', class_spells);

// Default endpoint
app.use(getDefault);

// Normal request
async function request(res, query, params) {

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  const data = await runQuery(query, params);
  res.send(JSON.stringify(data[0]));
}

// Normal functions
function spells(req, res) {
  let ids = req.params.ids;
  if (ids) {
    var params = {ids: ids.split(',').map((x) => +x)}
    request(res, queries.spellsByIds, params); 
  }
  else {
    request(res, queries.allSpells); 
  }
}

function class_spells(req, res) {
    request(res, queries.classSpells);
}

// BigQuery request
async function runQuery(query, params) {
  
  const options = {
    query: query,
    location: "southamerica-east1"
  };
  if (params) options["params"] = params

  return await bigquery.query(options);
}

// Default function
function getDefault(req, res) { res.status(404).send('Bad URL'); }

// Set our GCF handler to our Express app.
exports.app = app;