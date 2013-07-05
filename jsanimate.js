jsa = function (input) {
	return new jsa.prototype.init(input);
};

// array of html elements as input
jsa.prototype.init = function (input) {
	if (typeof input.push!="function") { return null; }
	
};

jsa.loop = {
	tick : 50,
	clock : 0,
	sets : [],
	init : function () {
		if (jsa.loop.clock==0) {
			jsa.loop.clock = window.setInterval(jsa.loop.run, jsa.loop.tick);
		}
		return jsa.loop.clock;
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
			for (i=0;i<jsa.loop.insert.sets.length;i++) {
				jsa.insert.frameset(jsa.loop.insert.frameset[i]);
			}
		}
		if (jsa.loop.insert.frames.length) {
			jsa.loop.stop();
			for (i=0;i<jsa.loop.insert.frames.length;i++) {
				jsa.insert.frameset(jsa.loop.insert.frame[i]);
			}
		}
		for (i=0; i<jsa.loop.sets.length; i++) {
			for (a=0; a<jsa.loop.sets[i].length; a++) {
				if (jsa.loop.sets[i][a].frames.length) {
					f = jsa.loop.sets[i][a].frames.pop();
					jsa(f.elements).run();
				}
			}
		}
		jsa.loop.init();
	},
	insert : {frames:[],sets:[]}
};

jsa.insert = {
	frame : function (setID, frameID, frame) {
		if (jsa.loop.clock>0) {
			jsa.loop.insert.frame.push([setID, frameID, frame]);
		} else {
			
		}
	},
	frameset : function (frameset) {
		var i;
		if (jsa.loop.clock>0) {
			jsa.loop.insert.sets.push(frameset);
		} else {
			for (i=0;i<jsa.loop.sets.length;i++) {
				if (jsa.loop.sets[i].setID == frameset.setID) {
					frameset = jsa.insert.syncsets(jsa.loop.sets[i], frameset);
					jsa.loop.sets.splice(i,1,frameset);
					return;
				}
			}
			jsa.loop.sets.push(frameset);
		}
	},
	syncsets : function (set1, set2) {
		var f, d, r;
		if (set1[0].id<set2[0].id||set1[set1.length-1].id<set2[set2.length-1].id) {
			d = set1[set1.length-1].id;
			r = [];
			while ((f=set2.pop()).id>d) { r.push(f); }
			while (f=r.pop()) { set1.push(f); }
			return set1;
		} else if (set1[0].id>set2[0].id||set1[set1.length-1].id>set2[set2.length-1].id) {
			d = set2[set2.length-1].id;
			r = [];
			while ((f=set1.pop()).id>d) { r.push(f); }
			while (f=r.pop()) { set2.push(f); }
			return set2;
		}
		if (set1.length!=set2.length) {
			console.log("Warning: syncsets encountered differently sized sets with the same beginning and ending frame ids.");
		}
		return set2;
	}
};
