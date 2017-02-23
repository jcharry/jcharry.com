require('babel-register');

const router = require('./index').default;
const Sitemap = require('../').default;

const filterConfig = {
	isValid: true,
	rules: [
		/\*/,
	]
};

const paramsConfig = {
	'/work/id/:projectId': [
		{
            projectId: [
                'hundreddays',
                'pds',
                'sasscan',
                'brasslamp',
                'tale',
                'ingredients',
                'cocoa',
                'eafus',
                'plasmicreflections',
                'quppled',
                'qad',
                'solarsynth',
                'colorflowers',
                'artistcomp',
                'particlesandwaves'
            ]
		}
	],
	'/blog/:post': [
		{
            post: [
                'post1',
                'physengine10',
                'physengine9',
                'physengine8',
                'physengine7',
                'physengine6',
                'physengine5',
                'physengine4',
                'physengine3',
                'physengine2',
                'physengine1',
                'reactmapboxgl',
                'javascript-gradient-descent',
                'vim-made-me-a-better-programmer'
            ]
		},
	],
};

(
	new Sitemap(router)
		.filterPaths(filterConfig)
		.applyParams(paramsConfig)
		.build('https://jcharry.com')
		.save('./sitemap.xml')
);
