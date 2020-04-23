const https = require('https')
const querystring = require('querystring')
const { fetchAuthorId, fetchPluginsData } = require('figma-plugins-stats')

const slackWebhooksURL = 'hooks.slack.com'
const designToolsURL = '/services/T04DM9FNE/B0127P1FR62/iJqb68fjpsnXWZ1GzDMSu26S'
let cabifyPluginsIds = []
let cabifyPlugins = []

function message(plugin) {
	return {
		icon_emoji: ':figma:',
		username: 'Figma Bot',
		text: `Update semanal de stats totales de ${plugin.name}: ${plugin.installCount} :package: — ${plugin.likeCount} :moradul: — ${plugin.viewCount} :eye:`
	}
}


(async function() {
		const cabify = await fetchAuthorId('cabify')
		const {plugins, orgsAndTeams} = await fetchPluginsData()

		// Search for Cabify in the orgs
		for (var id in orgsAndTeams) {
			if (id == cabify) cabifyPluginsIds = orgsAndTeams[id]
		}
		
		// Search in all the plugins a match for all our plugins
		plugins.forEach(plugin => {
			cabifyPluginsIds.forEach(pluginId => {
				if (plugin.id == pluginId) cabifyPlugins.push(plugin)
			})
		})
		
		
		// Send a message per each plugin
		cabifyPlugins.forEach(plugin => {
			let msg = message(plugin)
			const payload = querystring.stringify({ 'payload': JSON.stringify(msg) })
			const options = {
				hostname: slackWebhooksURL,
				path: designToolsURL,
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
    			'Content-Length': Buffer.byteLength(payload)
				}
			}
			
			const req = https.request(options, res => {
				console.log(`STATUS: ${res.statusCode}`);
	
				let body = ''
				res.on('data', d => body += d)
				res.on('end', () => {
						console.log('body', body)
				})
				
			})
			
			req.on('error', error => {
			  console.error(error)
			})
			
			req.write(payload)
			req.end()

		})
		
		
})()
