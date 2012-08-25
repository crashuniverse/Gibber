define([], function() {
    return {
		init: function(gibberish) {
			gibberish.Noise = Gen({
				name: "Noise",
				upvalues: { rnd:Math.random },
				callback: function() {
					return rnd() * 2 - 1;
				},
			});
				
			Gibberish.Sine = Gen({
			    name: "Sine",
			    props: { frequency: 440, amp: .25, channels:1, pan: 0 },
			    upvalues: { phase: 0, sin:Math.sin, pi_2:Math.PI * 2, panner:Gibberish.pan() },
 
			    callback: function(frequency, amp, channels, pan) {
			        phase += frequency / 44100;
			        var val = sin(phase * pi_2) * amp;
			        return channels === 2 ? panner(val, pan) : [val];
			    },
			});
			
			gibberish.LFO = Gen({
			    name: "LFO",
			    props: { frequency: 440, amp: .25, channels:1 },
			    upvalues: { phase: 0, sin: Math.sin, pi_2: Math.PI * 2 },
			
			    callback: function(frequency, amp) {
			        phase += frequency / 44100;
			        var val = sin(phase * pi_2) * amp;
			        return channels === 2 ? panner(val, pan) : [val];
			    },
			});
			
			
			gibberish.Square = Gen({
			    name: "Square",
			    props: { frequency: 440, amp: .15, channels:1, pan:0 },
			    upvalues: { phase: 0, panner:Gibberish.pan()  },
					
				// from audiolet https://github.com/oampo/Audiolet/blob/master/src/dsp/Square.js
			    callback: function(frequency, amp, channels, pan) {
					var out = phase > 0.5 ? 1 : -1;
				    phase += frequency / 44100;
				    phase = phase > 1 ? phase % 1 : phase;					
					return channels === 1 ? [out * amp] : panner(out * amp, pan);			    },
			});
			
			gibberish.Triangle = Gen({
			    name: "Triangle",
			    props: { frequency: 440, amp: .15, channels:1, pan:0 },
			    upvalues: { phase: 0, panner:Gibberish.pan()  },

			    callback: function(frequency, amp, channels, pan ) {
				    var out = 1 - 4 * Math.abs((phase + 0.25) % 1 - 0.5);
				    phase += frequency / 44100;
				    phase = phase > 1 ? phase % 1 : phase;
					return channels === 1 ? [out * amp] : panner(out * amp, pan);
			    },
			});
			
			gibberish.Saw = Gen({
			    name: "Saw",
			    props: { frequency: 440, amp: .15, channels:1, pan:0 },
			    upvalues: { phase: 0,panner:Gibberish.pan()  },

				// from audiolet https://github.com/oampo/Audiolet/blob/master/src/dsp/Saw.js					
			    callback: function(frequency, amp, channels, pan) {
				    var out = ((phase / 2 + 0.25) % 0.5 - 0.25) * 4;
				    phase += frequency / 44100;
				    phase = phase > 1 ? phase % 1 : phase;
					return channels === 1 ? [out * amp] : panner(out * amp, pan);
			    },
			});

			gibberish.KarplusStrong = Gen({
			  name:"KarplusStrong",
			  props: { blend:1, damping:0, amp:1, dampingValue:.5, channels:2, pan:0  },
			  upvalues: { phase: 0, buffer:[0], last:0, rnd:Math.random, panner:Gibberish.pan() },
  
			  note : function(frequency) {
			    var _size = Math.floor(44100 / frequency);
			    this.buffer = [];
    
			    for(var i = 0; i < _size; i++) {
			      this.buffer[i] = Math.random() * 2 - 1; // white noise
			    }
    
			    this.function.setBuffer(this.buffer);
			  },
  
			  callback : function(blend, __ignore, amp, damping, channels, pan) {
			    var val = buffer.shift();
			    var rndValue = (rnd() > blend) ? -1 : 1;

			    var value = rndValue * (val + last) * damping;

			    last = value;

			    buffer.push(value);
    
			    return panner(value * amp, pan);
			  },
  
			  setters: {
			  	damping: function(val) {
			    	this.dampingValue = .5 - val / 100;
			    }
			  },
			});
			
			/*gibberish.PolyKarplusStrong = Gen({
	  			name:"PolyKarplusStrong",
				addToGraph: true,
				inherits: "Bus",
  				//props: { blend:1, damping:0, amp:1, dampingValue:.5, voiceCount:0 },
  				//upvalues: { phase: 0, buffer:[0], last:0, rnd:Math.random },
				init : function() {
					console.log("INIT");
					this.children = [];
					for(var i = 0; i < this.maxVoices; i++) {
						var props = {
							blend:		this.blend,
							damping:	this.damping,
							amp: 		1,
						};
				
						var synth = Gibberish.KarplusStrong(props);
						synth.send(this, 1);
						Gibberish.dirty(synth);
						this.children.push(synth);
					}
					Gibberish.polyDefineProperties( this, ["amp","blend", "damping"] );
					Gibberish.dirty(this);
				},
				
				setters : {
					amp: function(value) {
						_amp = value;
						this.send(Master, value);
					},
				},
				
				note : function(_frequency) {
					var synth = this.children[this.voiceCount++];
					if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
					synth.note(_frequency);
				},
				
			});*/

			gibberish.generators.KarplusStrong2 = gibberish.createGenerator(["blend", "dampingValue", "amp", "headPos", "pan"], "{0}( {1}, {2}, {3}, {4},{5} )");
			gibberish.make["KarplusStrong2"] = this.makeKarplusStrong2;
			gibberish.KarplusStrong2 = this.KarplusStrong2;
			
			gibberish.generators.PolyKarplusStrong = gibberish.createGenerator(["blend", "dampingValue", "amp", "pan"], "{0}( {1}, {2}, {3}, {4} )");
			gibberish.make["PolyKarplusStrong"] = this.makePolyKarplusStrong;
			gibberish.PolyKarplusStrong = this.PolyKarplusStrong;
			
			// gibberish.generators.Mesh = gibberish.createGenerator(["input", "hitX", "hitY", "amp", "rate"], "{0}( {1}, {2}, {3}, {4}, {5} )");
			// gibberish.make["Mesh"] = this.makeMesh;
			// gibberish.Mesh = this.Mesh;
			
			// input, amp, tension, power, distance, speed
			gibberish.generators.Mesh = gibberish.createGenerator(["bang", "amp", "tension", "power", "size", "speed", "outY", "outX", "loss", "noise", "pan"], "{0}( {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10}, {11} )");
			gibberish.make["Mesh"] = this.makeMesh;
			gibberish.Mesh = this.Mesh;
			
			gibberish.Sampler = this.Sampler;
			gibberish.generators.Sampler = gibberish.createGenerator(["pitch", "amp", "isRecording", "isPlaying", "input", "bufferLength", "pan"], "{0}( {1}, {2}, {3}, {4}, {5}, {6}, {7} )");
			gibberish.make["Sampler"] = this.makeSampler;
			
			gibberish.generators.Grains = gibberish.createGenerator(["speed", "speedMin", "speedMax", "grainSize", "positionMin", "positionMax", "position", "reverse", "amp", "fade", "pan"], "{0}( {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10}, {11} )");
			gibberish.make["Grains"] = this.makeGrains;
			gibberish.Grains = this.Grains;	
		},

		PolyKarplusStrong : function(properties) {
			var that = Gibberish.Bus();
				
			Gibberish.extend(that, {
				amp:		 	1,
				blend:			1,
				damping:		0,
				maxVoices:		5,
				voiceCount:		0,
				children:		[],
				pan:			0,
				mod:			Gibberish.polyMod,
				removeMod:		Gibberish.removePolyMod,
				pan:			0,
				
				note : function(_frequency) {
					var synth = this.children[this.voiceCount++];
					if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
					synth.note(_frequency);
				},
			});
			
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			
			for(var i = 0; i < that.maxVoices; i++) {
				var props = {
					blend:		that.blend,
					damping:	that.damping,
					amp: 		1,
					pan:		that.pan,
				};
				
				var synth = Gibberish.KarplusStrong(props);
				
				synth.connect(that);

				that.children.push(synth);
			}
			
			Gibberish.polyDefineProperties( that, ["blend", "damping", "pan"] );
			
			/*(function() {
				var _amp = that.amp;
				Object.defineProperty(that, "amp", {
					get: function() { return _amp; },
					set: function(value) {
						_amp = value;
						that.send(Master, value);
					},
				});
			})();*/
			
			return that;
		},	
			
		Sampler : function() {
			var that = {
				type: 			"Sampler",
				category:		"Gen",
				audioFilePath: 	null,
				buffer : 		null,
				bufferLength:   null,
				pitch:			1,
				amp:			1,
				input:	 		0, //input || null,
				_input :    	0,
				length : 		ms(1000),
				shouldStart: 	false,
				isPlaying : 	false,
				isRecording: 	false,
				_function:		null,
				pan:			0,
				onload : 		function(decoded) {
					that.buffer = decoded.channels[0]; 
					that.bufferLength = decoded.length;
					
					console.log("LOADED ", that.audioFilePath, that.bufferLength);
					Gibberish.audioFiles[that.audioFilePath] = that.buffer;
					
					that._function = Gibberish.make["Sampler"](that.buffer); // only passs ugen functions to make
					
					window[that.symbol] = that._function;
					
					Gibberish.dirty(that);
				},
				note: function(pitch, amp) {
					if(typeof amp !== "undefined") { this.amp = amp; }
					
					this.pitch = pitch;
					
					if(this._function !== null) {
						this.isPlaying = true;
						if(pitch > 0) {
							this._function.setPhase(0);
						}else{
							this._function.setPhase(this.bufferLength);
						}
					}
				},
				record : function(input, recordLength) {					
					this.bufferLength = typeof recordLength === "undefined" ? this.bufferLength : recordLength;
					this.bufferLength = G.time(this.bufferLength); // TODO: should only be in Gibber, not Gibberish
					this._function.setWriteHead(0);
					
					// now this, this section below, THIS is a hack...
					this.mod("input", input, "=");
					this.buffer = new Float32Array(this.bufferLength);
					this.codeblock += ";";
					Gibberish.ugens.push(this);	
					this.isRecording = true;		
					this._function.setBuffer(this.buffer);		
				},
			};
			
			if(typeof arguments[0] !== "undefined") {
				if(typeof arguments[0] === "string") {
					that.audioFilePath = arguments[0];
					that.isPlaying = true;
				}else{ // wait to record samples
					that.input = arguments[0];
					that._input = arguments[0];
				}
			}
			
			Gibberish.extend(that, new Gibberish.ugen(that));
			
			if(typeof Gibberish.audioFiles[that.audioFilePath] !== "undefined") {
				that.buffer =  Gibberish.audioFiles[that.audioFilePath];
				that.bufferLength = that.buffer.length;
			}else if(that.audioFilePath !== null){
			    var request = new AudioFileRequest(that.audioFilePath);
			    request.onSuccess = that.onload;
			    request.send();
			}
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Sampler\"]();");	
			that._function = Gibberish.make["Sampler"](that.buffer, that); // only passs ugen functions to make
			window[that.symbol] = that._function;
			
			Gibberish.defineProperties( that, ["pitch", "amp", "isRecording", "isPlaying", "length", "input", "pan" ] );
			
			var _amp = that.amp;
			
			// TODO: why can't I reassign input?
			/*(function() {
				var __input = that.input;
				Object.defineProperty(that, "input", {
					get: function() { return __input; },
					set: function(value) {
						__input = value;
						that._input = value;
						Gibberish.dirty(that);
					},
				});
			})();*/
			
			return that;
		},
		
		makeSampler : function(buffer, self) {
			var phase = buffer === null ? 0 : buffer.length;
			var interpolate = Gibberish.interpolate;
			var write = 0;
			var panner = Gibberish.pan();
			var output = function(_pitch, amp, isRecording, isPlaying, input, length, pan) {
				var out = 0;
				phase += _pitch;
				
				if(write++ < length && isRecording) {
					//if(write % 10000 === 0) console.log(write, length);
					buffer[write] = input;
				}else if(write >= length && isRecording){
					self.isRecording = false;
					//self.input = 0;
					self.removeMod("input");
					Gibberish.ugens.remove(self);
					self.send(Master, 1);
					write = 0;
				}

				if(buffer !== null && phase < buffer.length && phase > 0 && isPlaying) {
					out = interpolate(buffer, phase);
				}
				return panner(out * amp, pan);
			};
			output.setPhase = function(newPhase) { phase = newPhase; };
			output.setWriteHead = function(newWriteHead) { write = newWriteHead; };			
			output.setBuffer = function(newBuffer) { buffer = newBuffer; };
			return output;
		},
		
		KarplusStrong2 : function(properties) {
			var that = { 
				type:		"KarplusStrong2",
				category:	"Gen",
				amp:		.5,
				damping:	0,
				dampingValue: .1,
				blend:		 1,
				buffer: 	new Float32Array(100),
				buffer2:	new Float32Array(100),
				headPos:	4,
				headCoeff:  .25,
				pan: 0,
				note : function(frequency) {
					var _size = Math.floor(44100 / frequency);
					this.buffer  = new Float32Array(_size); // needs push and shift methods
					this.buffer2 = new Float32Array(_size);;
					
					this.headPos = Math.round( _size * this.headCoeff);
					var last = 0;
					var phase = 0;
					for(var i = 0; i < _size ; i++) {
					    // if (phase < 1) {
					    // 		this.buffer[i] = this.buffer2[i] = 1 - 4 * Math.abs((phase + 0.25) % 1 - 0.5);   
					    // 		phase += frequency / 44100;
					    // }else{
							var newVal = Math.random() * 2 - 1; // white noise
							this.buffer[i] = this.buffer2[i] = (newVal + last) / 2; // filter
							last = newVal;
					    // }
					}
					this._function.setHeads(0, _size - 1, 0);
					this._function.setBuffer(this.buffer);
					this._function.setBuffer2(this.buffer2);					
				},
			};
			
			Gibberish.extend(that, new Gibberish.ugen(that));
			
			var damping = that.damping;
			
			Object.defineProperty(that, "damping", {
				get: function() {
					return damping * 100;
				},
				set: function(value) {
					damping = value / 100;
					that.dampingValue = .5 - damping;
					Gibberish.dirty(this);
				}
			});

			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			that.damping = that.damping;
			//that.dampingValue = .5 - that.damping;
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"KarplusStrong2\"]();");	
			that._function = Gibberish.make["KarplusStrong2"](that.buffer, that.buffer2);
			window[that.symbol] = that._function;
			
			Gibberish.defineProperties( that, ["blend", "amp", "headPos", "damping", "pan"] );
			return that;
		},
		
		makeKarplusStrong2: function(buffer, buffer2) {
			var phase = 0;
			var rnd = Math.random;
			var lastValue = 0;
			var lastValue2 = 0;
			var read1 = 0, read2 = 0, write = 0;
			var panner = Gibberish.pan();
			 
			var output = function(blend, damping, amp, headPos, pan) {
				var val = buffer[read1++];
				var val2 = buffer2[read2--];
				read1 = read1 >= buffer.length ? 0 : read1;
				read2 = read2 < 0 ? buffer.length - 1 : read2;
	
				var value = ((val + lastValue) ) * damping;
				var value2 = ((val2 + lastValue2) ) * damping;				
				
				//if(phase++ % 22050 === 0) console.lo	g(damping, read1, read2, value, value2, headPos);
				
				lastValue = value;
				lastValue2 = value2;				
		
				buffer[write] = value;
				buffer2[write] = value2;
				
				write = write < buffer.length - 1 ? write + 1 : 0;
				
				//if(phase++ % 22050 === 0) console.log("INSIDE", value, blend, damping, amp, val);
				//return buffer[(headPos + read1) % buffer.length] + (buffer2[(buffer.length - headPos + read2) % buffer.length] * -1) * amp;
				return panner( (value + (value2 * -1)) * amp, pan );
			};
			output.setBuffer  = function(buff) { buffer  = buff; };
			output.setBuffer2 = function(buff) { buffer2 = buff; };		
			output.setHeads = function(r1, r2, w) { read1 = r1; read2 = r2; write = w; }	
			output.getBuffer = function() { return buffer; };			

			return output;
		},
		
		/*Mesh : function(props) {
			var that = { 
				type:		"Mesh",
				category:	"Gen",
				amp:		props.amp || .5,
				input:		props.input,
				hitX :  	props.hitX || 3,
				hitY :  	props.hitY || 3,
				width:  	props.width || 16,
				height: 	props.height || 16,
				rate: 		props.rate || 10,
				gridType: 	props.gridType || "Grid",
			};
			Gibberish.extend(that, new Gibberish.ugen(that));

			var Junction = function(type) {
				var that = {
					phase : 0,
					neighbors : null,
					nearest : 	null,
					value : 0,
					_value : 0, // storage for simulation
					n1 : 0,
					n2 : 0,
					damping : .01,
					mode : 0,
					count : 0,
					type: type || "Grid",
					
					setNeighbors : function(neighbors) {
						this.neighbors = neighbors;
						this.nearest = [ neighbors[1], neighbors[3], neighbors[5], neighbors[7] ];
					},
					renderGrid : function(input) {

						var val = 0;
						// optimized kernel
						// 0.09398		0.3120	0.09398
						// 0.3120		0.3759	0.32120
						// 0.09398		0.3120	0.09398
						
						// if(this.neighbors[0] !== null) val += this.neighbors[0].n1 * 0.09398;
						// if(this.neighbors[1] !== null) val += this.neighbors[1].n1 * 0.3120;
						// if(this.neighbors[2] !== null) val += this.neighbors[2].n1 * 0.09398;
						// if(this.neighbors[3] !== null) val += this.neighbors[3].n1 * 0.3120;
						// if(this.neighbors[4] !== null) val += this.n1 * 0.3759;
						// if(this.neighbors[5] !== null) val += this.neighbors[5].n1 * 0.3120;
						// if(this.neighbors[6] !== null) val += this.neighbors[6].n1 * 0.09398;
						// if(this.neighbors[7] !== null) val += this.neighbors[7].n1 * 0.3120;
						// if(this.neighbors[8] !== null) val += this.neighbors[8].n1 * 0.09398;
						
						
						for(var i = 0; i < this.nearest.length; i++) {
							if(this.nearest[i] !== null) {
								//console.log("NON NULL NEIGHBOR", this.nearest[i].n1);
								//if(isNaN( this.nearest[i].n1 )) console.log("PROBLEM ", i);
								val += this.nearest[i].value;// - this.n2;
							}
						}
						
						
						val *= .5;
						val -= this.n1;
						val *= 1 - this.damping;
						
						if(typeof input === "number") { val += input; }

						this._value = val;

						return this._value;
					},
					renderTriangle : function(input) {
						val = 0;
						for(var i = 0; i < this.neighbors.length; i++) {
							if(this.neighbors[i] !== null) {
								val += this.neighbors[i].value;// - this.n2;
							}
						}

						val *= .333333;
						val -= this.n1;
						//val *= 2 / ( 2 * 6 * 6 / (.0001 * .0001 * 8 * 8) );
						val *= 1 - this.damping;

						if(typeof input === "number") { val += input; }
						
						//unit->yj = 1 / ( 2 * 6 * 6 / (.0001 * .0001 * 8 * 8) );
						//float yj_r = 1.0f / unit->yj;
						
						this._value = val;
						return this._value;
					},
					update : function() {
						//if(this.phase++ % 22050 === 0) console.log(this.n1);
						this.n2 = this.n1;
						this.n1 = this.value; //isNaN(this.value) ? this.n1 : this.value;
						this.value = this._value;
						//console.log("UPDATING", this);					
					}
				}
				
				that.render = that.type === "Grid" ? that.renderGrid : that.renderTriangle;
				return that;
			}
			
			var Triangle = function() {
				var rows = [
					"    * *    ",
					" * * * * * ",
					"* * * * * *",
					" * * * * * ",
					"* * * * * *",
					" * * * * * ",
					"    * *    ",
				];
				var grid = [];
				for(var i = 0; i < rows.length; i++) {
					var _row = rows[i].split("");
					grid[i] = [];
					for(var j = 0; j < _row.length; j++) {
						grid[i][j] = _row[j] === "*" ? Junction("Triangle") : null;
					}
				}
				for(var i = 0; i < grid.length; i++) {
					var row = grid[i];
					var above = i - 1;
					var below = i + 1;
					
					for(var col = 0; col < row.length; col++) {
						var left = 	col - 1;
						var right = col + 1;
						
						if( row[col] !== null) {
							var neighbors = [];
							var count = 0;
							if(above >= 0 && left >= 0) {
								neighbors[count++] = grid[above][left];
							}
							if(above >= 0 && right < row.length) {
								neighbors[count++] = grid[above][right];
							}
							if(left - 1 >= 0) {
								neighbors[count++] = grid[i][left - 1];
							}
							if(right + 1 < row.length) {
								neighbors[count++] = grid[i][right + 1];
							}
							if(below < grid.length && left >= 0) {
								neighbors[count++] = grid[below][left];
							}
							if(below < grid.length && right < row.length) {
								neighbors[count++] = grid[below][right];
							}
							
							row[col].neighbors = neighbors;
						}
					}
				}
				return grid;
			};
			
			var Grid = function(width, height) {
				var grid = [];
				for(var i = 0; i < height; i++) {
					grid[i] = [];
					for(var j = 0; j < width; j++) {
						grid[i][j] = Junction("Grid");
						
						grid[i][j].num = i * width + j;
						//if(grid[i][j].num === 8) grid[i][j].n1 = 1;
					}
				}
				
				for(var i = 0; i < height; i++) {
					var above = i - 1;
					var below = i + 1;
					
					for(var j = 0; j < width; j++) {
						var left = j - 1;
						var right = j + 1;
						var neighbors = [];
						for(var k = 0; k < width * height; k++) { neighbors[k] = null; }
						
						if(above >= 0) {
							if(left >= 0) {
								neighbors[0] = grid[above][left];
							}
							neighbors[1] = grid[above][j];
							if(right < width) {
								neighbors[2] = grid[above][right];
							}
						}
						if(left >= 0) {
							neighbors[3] = grid[i][left];
						}
						neighbors[4] = grid[i][j];
						if(right < width) {
							neighbors[5] = grid[i][right];
						}
						
						if(below < height) {
							if(left >= 0) {
								neighbors[6] = grid[below][left];
							}
							neighbors[7] = grid[below][j];
							if(right < width) {
								neighbors[8] = grid[below][right];
							}
						}
						grid[i][j].setNeighbors(neighbors);
					}
				}
				return grid;
			}
			
			that.grid = that.gridType === "Grid" ? Grid(that.width, that.height) : Triangle();
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Mesh\"]();");
			window[that.symbol] = Gibberish.make["Mesh"](that.grid);
			that._function = window[that.symbol];
						
			Gibberish.defineProperties( that, ["input", "amp", "hitX", "hitY", "rate"] );
			
			(function() {
				var _damping = that.damping;
				
				Object.defineProperty(that, "damping", {
					get: function() { return _damping; },
					set: function(value) {
						_damping = value;
						for(var i = 0; i < that.grid.length; i++) {
							for(var j = 0; j < that.grid[i].length; j++) {
								if(this.grid[i][j] !== null)
									this.grid[i][j].damping = _damping;
							}
						}
					},
				});
			})();
	
			return that;
		},
		
		
		makeMesh : function(grid) { // note, storing the increment value DOES NOT make this faster!
			var phase = 0;
			var debug = 0;
	
			var output = function(input, junctionX, junctionY, amp, rate) {
				var val = 0;
				phase++;
				if(phase >= rate) {
					for(var i = 0; i < grid.length; i++) {					
						for(var j = 0; j < grid[i].length; j++) {
							if(grid[i][j] !== null) {
								if(i === junctionY && j === junctionX) {
									val += grid[i][j].render(input);
								}else{
									val += grid[i][j].render();
								}
							}
						}
					}
				
					for(var i = 0; i < grid.length; i++) {					
						for(var j = 0; j < grid[i].length; j++) {
							if(grid[i][j] !== null)
								grid[i][j].update();
						}
					}

					phase -= rate;
				}
				
				var phaseMult = phase / rate;
				
				for(var i = 0; i < grid.length; i++) {					
					for(var j = 0; j < grid[i].length; j++) {
						var node = grid[i][j];
						if(node !== null) {
							//if(debug++ % 22050 === 0) console.log("phaseMult", phaseMult, node);
							val += node.n1 + (node.value - node.n1) * phaseMult;
						}
					}
				}				
				
				//if(debug++ % 22050 === 0) console.log("VALUE", val);
				
				return val * amp;
			}

			return output;
		},
		*/
		// based on https://ccrma.stanford.edu/~be/drum/drum.htm
		// TODO: Implement power normalized waveguide filters to allow changing of tension when drum is not sounding
		Mesh : function(properties) {
			var that = { 
				type:		"Mesh",
				category:	"Gen",
				amp:		.5,
				width:  	8,
				height: 	8,
				rate: 		10,
				gridType: 	"Grid",
				junctions : [],
				size:		15, // simulated distance between junctions
				speed: 		8, // wave speed
				loss:		.2,
				initTension:.4,
				tension:	0.03,
				power:		0.5,
				bang: 		0,
				noise: 		0,
				pan:		0,
				note: 		function(vol, _tension) {
					this.power = vol;
					var Yj = 2 * this.size * this.size / ( (this.initTension * this.initTension) * (this.speed * this.speed) );
					
					that._function.setNoise(1024);
					for(var i = 1; i < this.height - 1; i++ ) {
						for(var j = 1; j < this.width - 1; j++) {
							var junction = this.junctions[i][j];	
					
							var temp = vol * (i+j) / (this.height / this.width);
							var addValue = Yj * temp / 8; // 8 is number of ports per junction
							junction.v_junction += temp;
							junction.n_junction += addValue;
							junction.s_junction += addValue;
							junction.e_junction += addValue;
							junction.w_junction += addValue;
						}
					}
					if(typeof _tension !== "undefined") { this.tension = _tension; }
				},
			};
			
			Gibberish.extend(that, new Gibberish.ugen(that));
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			
			that.outX = isNaN(that.outX) ? that.width / 4 : that.outX;
			that.outY = isNaN(that.outY) ? that.width / 4 - 1 : that.outY;

			for(var i = 0; i < that.height; i++) {
				that.junctions[i] = [];
				for(var j = 0; j < that.width; j++) {
					that.junctions[i][j] = {
						v_junction: 0,
						n_junction: 0,
						s_junction: 0,
						e_junction: 0,
						w_junction: 0,
						c_junction: 0,
						s_temp:		0,
						e_temp:		0,
					};
				}
			}
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Mesh\"]();");
			window[that.symbol] = Gibberish.make["Mesh"](that.junctions, that.height, that.width);
			that._function = window[that.symbol];
			
			Gibberish.defineProperties( that, ["amp", "tension", "size", "speed", "outX", "outY", "loss", "noise", "pan"] );
			
			return that;
		},
		
		makeMesh : function(_junctions, _height, _width) { // note, storing the increment value DOES NOT make this faster!
			var phase = 0;
			var debug = 0;
			var heightBy4 = _height / 4;
			var widthBy4  = _width / 4;
			var noise = 0;
			var panner = Gibberish.pan();
			
			var output = function(input, amp, tension, power, distance, speed, outY, outX, loss, pan) {
				var val = 0;
				tension = tension >= 0.0001 ? tension : 0.0001;
				var junctions = _junctions;
				var height = _height;
				var width = _width;

				var Yj = 2 * (distance * distance) / ( (tension * tension) * (speed * speed) );
				var Yc = Yj-4;
				var oldfilt = junctions[height-heightBy4][width-widthBy4].v_junction;
				
				// var noiseAddition = 0;
				// if(noise-- > 0) {
				// 	noiseAddition = (Math.random() * 2 - 1) * .01;
				// }
				// var count = 0;
				// var numPoints = width * height;
				
				for(var i = 1; i < height - 1; i++ ) {
					for(var j = 1; j < width - 1; j++) {
						var junction = junctions[i][j];	
						junction.v_junction = 2 * (junction.n_junction + junction.s_junction + junction.e_junction + junction.w_junction + Yc * junction.c_junction) / Yj;
						//if(count++ < numPoints / 2)
						//	junction.v_junction += noiseAddition;
												
						junctions[i][j+1].s_junction = junction.v_junction - junction.n_junction;
						junctions[i][j-1].n_junction = junction.v_junction - junction.s_temp;						
						
						junctions[i+1][j].e_junction = junction.v_junction - junction.w_junction;
						junctions[i-1][j].w_junction = junction.v_junction - junction.e_temp;
						
						junction.c_junction = junction.v_junction - junction.c_junction;
						
						junction.s_temp = junction.s_junction;
						junction.e_temp = junction.e_junction;								
					}
					
					var _s = junctions[i][0].s_junction;
					junctions[i][0].s_junction = -1 * junctions[i][0].n_junction;
					junctions[i][1].s_junction = junctions[i][1].s_temp = _s;
					
					var _n = junctions[width - 1][0].n_junction;
					junctions[i][width-1].n_junction = -1 * junctions[i][width-1].s_junction;
					junctions[i][width-2].n_junction = _n;
					
					var _e = junctions[0][i].e_junction;
					junctions[0][i].e_junction = -1 * junctions[0][i].w_junction;
					junctions[1][i].e_junction = junctions[1][i].e_temp = _e;
					
					var _w = junctions[width-1][i].w_junction;
					junctions[width-1][i].w_junction = -1 * junctions[width-1][i].e_junction;
					junctions[width-2][i].w_junction = _w;
				}
				
				// the filtering below does nothing
				var filt = loss * (junctions[height-heightBy4][width-widthBy4].v_junction + oldfilt);
				oldfilt = junctions[height-heightBy4][width-widthBy4].v_junction;
				junctions[height-heightBy4][width-widthBy4].v_junction = filt;
				
				//x->mesh[WIDTH/4][WIDTH/4-1].v_junction;
				val += junctions[2][2].v_junction;

				return panner(val * amp, pan);
			};
			output.setNoise = function(val) { noise = val; };
			
			return output;
		},
		
		//gibberish.createGenerator(["numberOfGrains", "speedMin", "speedMax", "grainSize", "positionMin", "positionMax", "reverse"], "{0}( {1}, {2}, {3}, {4}, {5}, {6}, {7} )");
		Grains : function(properties) {
			var that = { 
				type:		"Grains",
				category:	"Gen",
				buffer: 	null,
				grainSize: 	ms(250),
				speedMin:   -0,
				speedMax: 	.0,
				speed: 		1,
				position:	.5,
				positionMin:0,
				positionMax:0,
				amp:		.2,
				reverse:	true,
				numberOfGrains:10,
				fade: .1,
				pan: 0,
			};
			Gibberish.extend(that, new Gibberish.ugen(that));
			
			// avoid copying the entire buffer in Gibberish.extend; instead, simply store a pointer
			if(typeof properties.buffer !== "undefined") that.buffer = properties.buffer;
			delete properties.buffer;
			
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			
			that.symbol = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"Grains\"]();");
			window[that.symbol] = Gibberish.make["Grains"](that.numberOfGrains, that);
			that._function = window[that.symbol];
						
			Gibberish.defineProperties( that, ["speed", "speedMin", "speedMax", "positionMin", "positionMax", "reverse", "position", "numberOfGrains", "amp", "grainSize", "pan"] );
			
			return that;
		},
		
		makeGrains: function(numberOfGrains, self) { // note, storing the increment value DOES NOT make this faster!
			var grains = [];
			for(var i = 0; i < numberOfGrains; i++) {
				grains[i] = {
					pos : self.position + rndf(self.positionMin, self.positionMax),
					speed : self.speed + rndf(self.speedMin, self.speedMax),
				}
				grains[i].start = grains[i].pos;
				grains[i].end = grains[i].pos + self.grainSize;
				grains[i].fadeAmount = grains[i].speed * (self.fade * self.grainSize);
			}
			var buffer = self.buffer;
			var interpolate = Gibberish.interpolate;
			var debug = 0;
			var panner = Gibberish.pan();

			var output = function(speed, speedMin, speedMax, grainSize, positionMin, positionMax, position, reverse, amp, fade, pan) {	
				var val = 0;
				for(var i = 0; i < numberOfGrains; i++) {
					var grain = grains[i];
					
					if(grain.speed > 0) {
						if(grain.pos > grain.end) {
							grain.pos = (position + rndf(positionMin, positionMax)) * buffer.length;
							grain.start = grain.pos;
							grain.end = grain.start + grainSize;
							grain.speed = speed + rndf(speedMin, speedMax);
							grain.fadeAmount = grain.speed * (fade * grainSize);
						}
						
						var _pos = grain.pos;
						while(_pos > buffer.length) _pos -= buffer.length;
						while(_pos < 0) _pos += buffer.length;
						
						var _val = interpolate(buffer, _pos);
					
						_val *= grain.pos < grain.fadeAmount + grain.start ? (grain.pos - grain.start) / grain.fadeAmount : 1;
						_val *= grain.pos > (grain.end - grain.fadeAmount) ? (grain.end - grain.pos)   / grain.fadeAmount : 1;
						
					}else {
						if(grain.pos < grain.end) {
							grain.pos = (position + rndf(positionMin, positionMax)) * buffer.length;
							grain.start = grain.pos;
							grain.end = grain.start - grainSize;
							grain.speed = speed + rndf(speedMin, speedMax);
							grain.fadeAmount = grain.speed * (fade * grainSize);							
						}
						
						var _pos = grain.pos;
						while(_pos > buffer.length) _pos -= buffer.length;
						while(_pos < 0) _pos += buffer.length;
					
						var _val = interpolate(buffer, _pos);
					
						_val *= grain.pos > grain.start - grain.fadeAmount ? (grain.start - grain.pos) / grain.fadeAmount : 1;
						_val *= grain.pos < (grain.end + grain.fadeAmount) ? (grain.end - grain.pos) / grain.fadeAmount : 1;
					}

				    val += _val;
					
					grain.pos += grain.speed;
				}
				
				return panner(val * amp, pan);
			};
			
			output.makeGrains = function(_buffer) {
				buffer = _buffer;
				phase = 0;
			};
	
			return output;
		},
		
		
    }
});
