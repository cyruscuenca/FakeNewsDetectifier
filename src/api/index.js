import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
const validUrl = require('valid-url');
const url = require("url");


export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	// perhaps expose some API metadata at the root
	api.get('/news/rate', (req, res) => {
		var result = url.parse(req.query.link);
		console.log('Rating ' + req.query.link);
		if (validUrl.isUri(req.query.link)){
			console.log('Looks like an URI');
			res.json({ confidence: 1, bias: "Far right"  });
		} 
		else {
			console.log('Not a URI');
			res.sendStatus(400);
		}
	});

	return api;
}
