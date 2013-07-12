jsa = function (input) {
	return new jsa.prototype.init(input);
};

// array of html elements as input
jsa.prototype.init = function (input) {
	if (typeof input.push!="function") { return null; }
	var i;
	this.elar = [];
	for (i=0; i<input.length; i++) {
		if (input[i].style) {
			this.elar.push(input[i]);
		}
	}
	
	// internal stuff -- priveledged for plugins
	this.frameset = {setID:0, frames:[]};
	this.secondSets = [];
	this.scheduleFrame = function (frame) {
		while (this.frameset.frames.length<(frame.id+1)) {
			this.frameset.frames.push({
				elements : this.elar,
				id : this.frameset.frames.length,
				data : []
			});
		}
		if (this.frameset.frames[frame.id].data.length>0&&frame.data) {
			this.frameset.frames[frame.id].data = this.frameset.frames[frame.id].data.concat(frame.data);
		} else if (frame.data) {
			this.frameset.frames[frame.id].data = frame.data;
		}
		if (this.frameset.frames[frame.id].actions&&frame.actions) {
			this.frameset.frames[frame.id].actions = this.frameset.frames[frame.id].actions.concat(frame.actions);
		} else if (frame.actions) {
			this.frameset.frames[frame.id].actions = frame.actions;
		}
	};
	this.conflict = function (csskey, startframe, endframe) {
		if (this.frameset.frames.length<startframe) { return 0; }
		var i, d = 0, e;
		for (i=startframe;i<endframe,i<this.frameset.frames.length;i++) {
			for (e=0;e<this.frameset.frames[i].data.length;e++) {
				if (this.frameset.frames[i].data[e].csskey == csskey) {
					d = i - startframe + 1;
				}
			}
		}
		return (d>0)?d+10:0;
	};
	this.mergeSets = function (fset) {
		var i, a, e, c, t;
		this.frameset = jsa.insert.syncsets(this.frameset, fsets);
		for (i=fset[0].id,e=0;i<this.frameset.length,i<fset[fset.length-1].id,e<fset.length;i++,e++) {
			for (a=0;a<fset[e].data.length;a++) {
				t = true;
				for (c=0;c<this.frameset[i].data.length;c++) {
					if (this.frameset[i].data[c].csskey==fset[e].data[a].csskey) { t = false; }
				}
				if (t) { this.frameset[i].data.push(fset[e].data[a]); }
			}
		}
		return this;
	};
	
	
	// priveledged methods
	this.getSet = function () { return this.frameset; };
	
	// position methods
	// each time and delay increment is equal to 20 frames (1 second)
	this.move = function (fromxy, toxy, time, delay) {
		if (typeof fromxy!="object"||typeof fromxy.push!="function"||typeof toxy!="object"||typeof toxy.push!="function") { return this; }
		if (typeof time!="number") { time = isNaN(parseInt(time)) ? 1 : parseInt(time); }
		if (typeof delay!="number") { delay = isNaN(parseInt(time)) ? 0 : parseInt(delay); }
		var i, a, c, f, delayx, delayy;
		delayx = delay + this.conflict("left", delay*20, delay*20+time*20)/20;
		delayy = delay + this.conflict("top", delay*20, delay*20+time*20)/20;
		f = { id:delayx*20, data:[
			{type:"assign",csskey:"left",value:fromxy[0] + "px"},
			{type:"assign",csskey:"position",value:"relative"}
		]}; this.scheduleFrame(f);
		f = { id:delayy*20, data:[
			{type:"assign",csskey:"top",value:fromxy[1] + "px"}
		]}; this.scheduleFrame(f);
		for (i=1; i<time*20-1; i++) {
			f = {id:delayx*20+i, data:[
				{
					type : (fromxy[0]>toxy[0]) ? "subtract" : "add",
					csskey : "left",
					amount : ((fromxy[0]>toxy[0])? fromxy[0]-toxy[0] : toxy[0] - fromxy[0])/(time*20)
				}
			]};this.scheduleFrame(f);
			f = {id:delayy*20+i, data:[
				{
					type: (fromxy[1]>toxy[1]) ? "subtract" : "add",
					csskey : "top",
					amount : ((fromxy[1]>toxy[1])? fromxy[1]-toxy[1] : toxy[1] - fromxy[1])/(time*20)
				}
			]};
			this.scheduleFrame(f);
		}
		this.scheduleFrame({id:time*20+delayx*20, data:[{type:"assign",csskey:"left",value:toxy[0]+"px"}]});
		this.scheduleFrame({id:time*20+delayy*20, data:[{type:"assign",csskey:"top",value:toxy[1]+"px"}]});
		return this;
	};
	this.moveTo = function (xy, time, delay) {
		if (typeof xy!="object"||typeof xy.push!="function") { return false; }
		var x, y, r, a, i, t;
		for (a=0; a<this.elar.length; a++) {
			x = (typeof this.elar[a].style["left"]=="string"&&!isNaN(parseFloat(this.elar[a].style["left"]))) ? parseFloat(this.elar[a].style["left"]) : 0;
			y = (typeof this.elar[a].style["top"]=="string"&&!isNaN(parseFloat(this.elar[a].style["top"]))) ? parseFloat(this.elar[a].style["top"]) : 0;
			r = jsa([this.elar[a]]).move([x,y], xy, time, delay);
			t = false;
			for (i=0;i<this.secondSets.length;i++) {
				if (this.secondSets[i].elar[0]==this.elar[a]&&this.secondSets[i].elar.length==1) {
					t = true;
					this.secondSets[i].mergeSets(r.frameset);
				}
			}
			if (!t) { this.secondSets.push(r); }
		}
		return this;
	};
	this.drop = function (xyamounts, time, delay) {};
	
	// size/shape methods
	this.grow = function () {};
	this.shrink = function () {};
	this.size = function () {};
	this.warp = function () {};
	
	// color/opacity methods
	this.toColor = function () {};
	this.toBGColor = function () {};
	this.color = function () {};
	this.BGColor = function () {};
	this.fadeOut = function () {};
	this.fadeIn = function () {};
	
	// other
	this.assign = function () {};
	this.insertSets = function () {
		var r = [], i;
		r.push(jsa.insert.frameset(this.frameset));
		r[1] = [];
		while (i = this.secondSets.pop()) {
			r[1].push(jsa.insert.frameset(i.frameset));
		}
		return r;
	};
	
	// private methods
	function validCssRule(input) {
		if (typeof input!="object"||input.push) {
			return false;
		}
		return true;
	}
	function handleCss (input) {
		if (!validCssRule) {
			return false;
		}
		
	}
};

jsa.loop = {
	tick : 50,
	clock : 0,
	sets : [],
	init : function () {
		if (jsa.loop.clock==0) {
			jsa.loop.clock = window.setInterval(jsa.loop.run, jsa.loop.tick);
		}
	},
	stop : function () {
		if (jsa.loop.clock>0) {
			window.clearInterval(jsa.loop.clock);
			jsa.loop.clock = 0;
		}
	},
	run : function () {
		var i, a, f;
		if (jsa.loop.insert.sets.length) {
			jsa.loop.stop();
			jsa.insert.run();
		}
		if (jsa.loop.insert.frames.length) {
			jsa.loop.stop();
			jsa.insert.run();
		}
		for (i=0; i<jsa.loop.sets.length; i++) {
			for (a=0; a<jsa.loop.sets[i].frames.length; a++) {
				if (jsa.loop.sets[i].frames[a].length) {
					f = jsa.loop.sets[i].frames[a].pop();
					jsa.run(f);
				}
			}
		}
		jsa.loop.init();
	},
	insert : {frames:[],sets:[]}
};

jsa.insert = {
	frame : function (setID, frameID, frame) {
		var i;
		jsa.loop.insert.frames.push([setID, frameID, frame]);
		if (jsa.loop.clock==0) {
			jsa.insert.run();
		}
	},
	frameset : function (frameset) {
		var i;
		if (frameset.setID<1) {
			frameset.setID = (jsa.loop.sets.length+jsa.loop.insert.sets.length);
		}
		jsa.loop.insert.sets.push(frameset);
		if (jsa.loop.clock==0) {
			jsa.insert.run();
		}
		return frameset.setID;
	},
	run : function () {
		var i;
		// sets first
		while (i = jsa.loop.insert.sets.pop()) {
			jsa.insert.insertset(i);
		}
		// frames second
		while (i = jsa.loop.insert.frames.pop()) {
			jsa.insert.insertframe(i);
		}
	},
	
	// internal functions; do not call these manually
	insertset : function (frameset) {
		if (typeof frameset.frames.push!="function") { return; }
		if (typeof frameset.setID!="number") { frameset.setID = jsa.loop.sets.length; }
		for (i=0;i<jsa.loop.sets.length;i++) {
			if (jsa.loop.sets[i].setID == frameset.setID) {
				frameset = jsa.insert.syncsets(jsa.loop.sets[i], frameset);
				jsa.loop.sets.splice(i,1,frameset);
				return;
			}
		}
		jsa.loop.sets.push(frameset);
	},
	insertframe : function () {
		
	},
	syncsets : function (set1, set2) {
		var f, d, r;
		if (set1.frames[0].id<set2.frames[0].id||set1.frames[set1.frames.length-1].id<set2.frames[set2.frames.length-1].id) {
			d = set1.frames[set1.frames.length-1].id;
			r = [];
			while ((f=set2.frames.pop()).id>d) { r.push(f); }
			while (f=r.pop()) { set1.frames.push(f); }
			return set1;
		} else if (set1.frames[0].id>set2.frames[0].id||set1.frames[set1.frames.length-1].id>set2.frames[set2.frames.length-1].id) {
			d = set2.frames[set2.frames.length-1].id;
			r = [];
			while ((f=set1.frames.pop()).id>d) { r.push(f); }
			while (f=r.pop()) { set2.frames.push(f); }
			return set2;
		}
		if (set1.length!=set2.length) {
			console.log("Warning: syncsets encountered differently sized sets with the same beginning and ending frame ids.");
		}
		return set2;
	}
};

jsa.run = function (frame, element) {
	if (typeof frame!="object"||typeof frame.data!="object") { return false; }
	if (typeof frame.elements=="undefined"&&typeof element!="undefined") { frame.elements = [element]; }
	if (typeof frame.elements=="undefined") { return false; }
	if (typeof frame.elements.push!="function"||typeof frame.data.push!="function") { return false; }
	var i, a, c, r, t, n;
	
	for (i=0; i<frame.data.length; i++) {
		// subtract
		if (frame.data[i].type=="subtract"&&typeof frame.data[i].amount=="number") {
			if (typeof frame.data[i].csskey=="string") {
				for (a=0;a<frame.elements.length;a++) {
					t = frame.elements[a];
					if (t.style&&typeof t.style[frame.data[i].csskey]=="string") {
						if (t.style[frame.data[i].csskey].indexOf("px")>=0) {
							t.style[frame.data[i].csskey] = (isNaN(parseFloat(t.style[frame.data[i].csskey])) ?
								0-frame.data[i].amount : parseFloat(t.style[frame.data[i].csskey])-frame.data[i].amount).toString() + "px";
						} else {
							t.style[frame.data[i].csskey] = (isNaN(parseFloat(t.style[frame.data[i].csskey])) ?
								0-frame.data[i].amount : parseFloat(t.style[frame.data[i].csskey])-frame.data[i].amount).toString();
						}
					}
				}
			}
		} else if (frame.data[i].type=="add"&&typeof frame.data[i].amount=="number") {
			if (typeof frame.data[i].csskey=="string") {
				for (a=0;a<frame.elements.length;a++) {
					t = frame.elements[a];
					if (t.style&&typeof t.style[frame.data[i].csskey]=="string") {
						if (t.style[frame.data[i].csskey].indexOf("px")>=0) {
							t.style[frame.data[i].csskey] = (isNaN(parseFloat(t.style[frame.data[i].csskey])) ?
								frame.data[i].amount : parseFloat(t.style[frame.data[i].csskey])+frame.data[i].amount).toString() + "px";
						} else {
							t.style[frame.data[i].csskey] = (isNaN(parseFloat(t.style[frame.data[i].csskey])) ?
								frame.data[i].amount : parseFloat(t.style[frame.data[i].csskey])+frame.data[i].amount).toString();
						}
					}
				}
			}
		} else if (frame.data[i].type=="merge"&&typeof frame.data[i].amount=="number"&&typeof frame.data[i].csskey=="string") {
			if (typeof frame.data[i].initial=="object"||typeof frame.data[i].end=="object"||typeof frame.data[i].end=="string"||typeof frame.data[i].initial=="string") {
				t = (typeof frame.data[i].initial!="string") ? jsa.dependencies.intToHex(frame.data[i].initial) : frame.data[i].initial;
				r = (typeof frame.data[i].end!="string") ? jsa.dependencies.intToHex(frame.data[i].end) : frame.data[i].end;
				c = frame.data[i].amount; if (c>1||c<0) { c = 1; }
				n = jsa.dependencies.betweenColors(t,r,c,1-c);
				for (a=0;a<frame.elements.length;a++) {
					frame.elements[a].style[frame.data[i].csskey] = "#" + n;
				}
			}
		} else if (frame.data[i].type=="assign"&&typeof frame.data[i].csskey=="string"&&typeof frame.data[i].value!="undefined") {
			for (a=0;a<frame.elements.length;a++) {
				frame.elements[a].style[frame.data[i].csskey] == frame.data[i].value;
			}
		} else if (frame.data[i].type=="modifychild") {
			if (typeof frame.data[i].child=="object")  {
				r = [];
				// by tag
				if (typeof frame.data[i].child.tag=="string") {
					for (a=0; a<frame.elements; a++) {
						t = frame.elements[a].getElementsByTagName(frame.data[i].child.tag);
						for (n=0;n<t.length;n++) {
							r.push(t[n]);
						}
					}
				}
				// by class names
				if (typeof frame.data[i].child.className=="string") {
					for (a=0; a<frame.elements.length; a++) {
						for (c=0;c<frame.elements[a].childNodes.length;c++) {
							if (frame.elements[a].childeNodes[c].className.length>0) {
								t = frame.elements[a].childNodes[c].className.split(" ");
								s = frame.data[i].child.className.split(" ");
								for (n=0; n<t.length; n++) {
									if (s.indexOf(t[n])>=0 && r.indexOf(frame.elements[a].childeNodes[c])<0) {
										r.push(frame.elements[a].childNodes[c]);
									}
								}
							}
						}
					}
				}
				// other
				if (typeof frame.data[i].child.other=="object") {
					for (t in frame.data[i].child.other) {
						for (a=0;a<frame.elements.length;a++) {
							for (c=0;c<frame.elements[a].childNodes.length;c++) {
								if (typeof frame.elements[a].childNodes[c][t]!="undefined"){
									if (frame.elements[a].childNodes[c][t] = frame.data[i].child.other[t]) {
										if (r.indexOf(frame.elements[a].childeNodes[c])<0) { r.push(frame.elements[a].childNodes[c]); }
									}
								}
							}
						}
					}
				}
			}
			while (t = r.pop()) {
				jsa.run(frame.data[i].frame, t);
			}
		} else if (frame.data[i].type=="custom") {
			// custom handlers part 1
			if (frame.actions&&frame.actions.length&&typeof frames.actions.push=="function") {
				for (a=0; a<frames.actions.length; a++) {
					if (typeof frame.actions[i]=="function") { frame.actions[i].call(frame, frame.elements[a], frame.data[i]); }
				}
			}
		}
	}
	
	// custom handlers part 2 -- may remove in future
	// debating over whether custom data types must be included in frame or not, though it makes more sense that way
	if (frame.actions&&frames.actions.length&&typeof frames.actions.push=="function") {
		for (i=0; i<frame.actions.length; i++) {
			for (a=0; a<frame.elements.length; a++) {
				frame.actions[i].call(this, frame.elements[a]);
			}
		}
	}
};

jsa.dependencies = {
	intToHex : function (n) {
		if (typeof n=="string") { return n; }
		if (typeof n!="object"||typeof n.push!="function") { return "000000"; }
		var tm, ret = ""; n.reverse();
		while (tm = n.pop()) {
			if (isNaN(tm)) { tm = 0; }
			ret += (tm.toString(16).length==1) ? "0"+tm.toString(16) : tm.toString(16);
		}
		return ret;
	},
	hexToInt : function (h) {
		if (typeof h=="object"&&typeof h.push=="function"&&typeof h.length=="number"&&typeof h[0]=="number") { return h; }
		if (typeof h!="string") { return [0,0,0]; }
		h = h.replace("#", "");
		var ret = [], tm = [], hr = h.split("");
		hr.reverse();
		while ((tm[0] = hr.pop())&&(tm[1] = hr.pop())) {
			ret.push( isNaN(parseInt(tm[0]+tm[1], 16)) ? 0 : parseInt(tm[0]+tm[1], 16));
		}
		return ret;
	},
	betweenColors : function (c1, c2, p1, p2) {
		var d1 = jsa.dependencies.hexToInt(c1),
		d2 = jsa.dependencies.hexToInt(c2), i, d3 = [];
		for (i=0; i<3; i++) {
			d3[i] = Math.ceil(p1*d1[i] + p2*d2[i]);
			if (d3[i]>255) { d3[i] = 255; }
		}
		return jsa.dependencies.intToHex(d3);
	}
};
