const { JSDOM } = require('jsdom')
const { convert } = require('convert-svg-to-png')

module.exports = async (req, res) => {
	try {
		const [range, valueString] = req.url.replace('/', '').split('/')
		const [min, max] = range.split('-')
		const value = parseInt(valueString)

		// Generate colour regions for the chart
		const rangeSegment = Math.floor((max - min) / 4)

		// Create a new virtual DOM
		const DOM = new JSDOM(`<!DOCTYPE html><div></div>`)
		// Assign virtual DOM on the node global object
		global.window = DOM.window
		// Attach the Gauge onto the global window
		window.Gauge = require('svg-gauge')
		// Create a reference to the virtual DOM node
		const el = window.document.querySelector('div')

		// Create a new Gauge
		window.Gauge(el, {
			min,
			max: max > value ? max : value,
			value,
			// custom label renderer
			label: function(value) {
				if (max > value) {
					return `${value} / ${max}`
				} else {
					return `Wow! ${value}`
				}
			},
			dialStartAngle: 90,
			dialEndAngle: 0,
			// radius: 40,
			// Custom dial colors (Optional)
			color: function(value) {
				if (value < rangeSegment) {
					return '#ef4655' // red
				} else if (value < rangeSegment * 2) {
					return '#f7aa38' // orange
				} else if (value < rangeSegment * 3) {
					return '#fffa50' // yellow
				} else {
					return '#5ee432' // green
				}
			}
		})

		// Create png using Chromium
		const png = await convert(el.innerHTML, {
			width: 150,
			height: 150
		})
		// Send response
		res.setHeader('Content-Type', 'image/png')
		res.end(png)
	} catch (error) {
		console.error(error)
	}
}
