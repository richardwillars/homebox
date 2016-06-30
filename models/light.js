var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//colour must be specifed in the following format: "hue:120 saturation:1.0 brightness:0.5"
var LightSchema = new mongoose.Schema({
	_id: false,
	name: {
		type: String,
		required: true
	},
	deviceId: {
		type: String,
		required: true
	},
	capabilities: {
		toggle: {
			type: Boolean,
			default: false,
			responseSchema: {
				"$schema": "http://json-schema.org/draft-04/schema#",
				"type": "object",
				"properties": {
					"toggled": {
						"type": "boolean"
					}
				},
				"required": [
					"toggled"
				]
			}
		},
		setState: {
			type: Boolean,
			default: false,
			requestSchema: {
				"$schema": "http://json-schema.org/draft-04/schema#",
				"type": "object",
				"properties": {
					"on": {
						"type": "boolean"
					},
					"colour": {
						"type": "object",
						"properties": {
							"hue": {
								"type": "integer",
								"minimum": 0,
								"maxiumum": 360
							},
							"saturation": {
								"type": "double",
								"minimum": 0,
								"maximum": 1
							},
							"brightness": {
								"type": "double",
								"minimum": 0,
								"maximum": 1
							}
						},
						"required": [
							"hue",
							"saturation",
							"brightness"
						]
					},

					"duration": {
						"duration": "integer",
						"minimum": 0,
						"maxiumum": 99999
					}
				},
				"required": [
					"colour",
					"duration",
					"on"
				]
			},
			responseSchema: {
				"$schema": "http://json-schema.org/draft-04/schema#",
				"type": "object",
				"properties": {
					"processed": {
						"type": "boolean"
					}
				},
				"required": [
					"processed"
				]
			}

		},
		breatheEffect: {
			type: Boolean,
			default: false,
			requestSchema: {
				"$schema": "http://json-schema.org/draft-04/schema#",
				"type": "object",
				"properties": {
					"colour": {
						"type": "object",
						"properties": {
							"hue": {
								"type": "integer",
								"minimum": 0,
								"maxiumum": 360
							},
							"saturation": {
								"type": "double",
								"minimum": 0,
								"maximum": 1
							},
							"brightness": {
								"type": "double",
								"minimum": 0,
								"maximum": 1
							}
						},
						"required": [
							"hue",
							"saturation",
							"brightness"
						]
					},
					"fromColour": {
						"type": "object",
						"properties": {
							"hue": {
								"type": "integer",
								"minimum": 0,
								"maxiumum": 360
							},
							"saturation": {
								"type": "double",
								"minimum": 0,
								"maximum": 1
							},
							"brightness": {
								"type": "double",
								"minimum": 0,
								"maximum": 1
							}
						},
						"required": [
							"hue",
							"saturation",
							"brightness"
						]
					},
					"period": {
						"type": "double",
						"minimum": 0.01,
						"maximum": 100
					},
					"cycles": {
						"duration": "double",
						"minimum": 0.01,
						"maxiumum": 99999
					},
					"persist": {
						"type": "boolean"
					},
					"peak": {
						"type": "double",
						"minimum": 0,
						"maximum": 1
					}
				},
				"required": [
					"colour",
					"period",
					"cycles",
					"persist",
					"peak"
				]

			},
			responseSchema: {
				"$schema": "http://json-schema.org/draft-04/schema#",
				"type": "object",
				"properties": {
					"processed": {
						"type": "boolean"
					}
				},
				"required": [
					"processed"
				]
			}
		},
		pulseEffect: {
			type: Boolean,
			default: false,
			requestSchema: {
				"$schema": "http://json-schema.org/draft-04/schema#",
				"type": "object",
				"properties": {
					"colour": {
						"type": "object",
						"properties": {
							"hue": {
								"type": "integer",
								"minimum": 0,
								"maxiumum": 360
							},
							"saturation": {
								"type": "double",
								"minimum": 0,
								"maximum": 1
							},
							"brightness": {
								"type": "double",
								"minimum": 0,
								"maximum": 1
							}
						},
						"required": [
							"hue",
							"saturation",
							"brightness"
						]
					},
					"fromColour": {
						"type": "object",
						"properties": {
							"hue": {
								"type": "integer",
								"minimum": 0,
								"maxiumum": 360
							},
							"saturation": {
								"type": "double",
								"minimum": 0,
								"maximum": 1
							},
							"brightness": {
								"type": "double",
								"minimum": 0,
								"maximum": 1
							}
						},
						"required": [
							"hue",
							"saturation",
							"brightness"
						]
					},
					"period": {
						"type": "double",
						"minimum": 0.01,
						"maximum": 100
					},
					"cycles": {
						"duration": "double",
						"minimum": 0.01,
						"maxiumum": 99999
					},
					"persist": {
						"type": "boolean"
					}
				},
				"required": [
					"colour",
					"period",
					"cycles",
					"persist"
				]

			},
			responseSchema: {
				"$schema": "http://json-schema.org/draft-04/schema#",
				"type": "object",
				"properties": {
					"processed": {
						"type": "boolean"
					}
				},
				"required": [
					"processed"
				]
			}
		}
	}
});


var Light = mongoose.model('Light', LightSchema);

module.exports = Light;