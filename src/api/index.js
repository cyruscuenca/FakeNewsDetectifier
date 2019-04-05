import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
const validUrl = require('valid-url');
const url = require("url");
const jsdom = require("jsdom");
const request = require('request');

function rate(url, rating) {
	let link = 'https://www.alexa.com/siteinfo/' + url.host;
	request(link, function (error, response, body) {
	  	console.log('error:', error); // Print the error if one occurred
		console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
		  
	  	const dom = new jsdom.JSDOM(body);
		const alexaRank = parseInt(dom.window.document.getElementsByClassName('globleRank')[0].getElementsByClassName('metrics-data')[0].textContent);

		// If alexaMultiplier is 1, it will have no effect on the rating
		let alexaMultiplier = 1;

		// If the site is ranked, create a multiplier larger than 1 to manipulate the rating
		if(!isNaN(alexaRank)) {
			alexaMultiplier = alexaRank; // Modify this to create a multiplier
		}

		// Do stuff with alexa

		rating(alexaMultiplier);
	});
}

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
		// Validate URL
		if (validUrl.isUri(req.query.link)){
			console.log('Looks like an URI');

			// Rate story
			rate(url.parse(req.query.link), (rating) => {
				// Return ratings
				res.json({ confidence: rating, bias: rating });
			});
		} 
		else {
			console.log('Not a URI');
			res.sendStatus(400);
		}
	});

	return api;
}
