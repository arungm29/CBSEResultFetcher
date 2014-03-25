

	var rollnos = [];	//stores roll numbers
	var page = new WebPage(), testindex = 0, loadInProgress = false, rollindex = 0;	//testindex is used to iterate through each function in the steps[] array; rollindex is used to iterate through the rollnos[] array
	var fs = require('fs');	//for writing to a file
	var k;	//used in the for loop below
	for (k = 9180000; k <= 9189999; k++) {
		//Change the range above as you please
		rollnos.push(k);
	}

	function setGlobal(page, name, data) {	//A fancy function that will make our variables global
    	var json = JSON.stringify(data);		//so that they're accessible inside page.evaluate()
    	var fn = 'return window[' + JSON.stringify(name) + ']=' + json + ';';
    	return page.evaluate(new Function(fn));
	}

	page.onConsoleMessage = function(msg) {	//console.log inside page.evaluate() doesn't work without this
	  console.log(msg);
	};
	//onLoadStarted and onLoadFinished are triggered during step 1 and step 3
	page.onLoadStarted = function() {
	  loadInProgress = true;
	  console.log("load started");
	};

	page.onLoadFinished = function() {
	  loadInProgress = false;
	  console.log("load finished");
	};

	var steps = [
	  function() {	//First function: Opens page
	    page.open("http://cbseresults.nic.in/class12/cbse122013.htm");


	  }, function() {	//Second Function: Fills that form
	  	setGlobal(page, '_rollno', rollnos[rollindex]);	//Made the current roll number accesssible in the form of a new variable: _rollno
	    page.evaluate(function() {
	      document.getElementsByName("FrontPage_Form1")[0].elements["regno"].value = _rollno.toString();	//There's just one form on the page, so I can access it at the 0th index
	    });
	  }, 


	  function() {	//Third Function: Fills that form and submits it
	    page.evaluate(function() {
	      var arr = document.getElementsByName("FrontPage_Form1");
	      arr[0].submit();	//There's just one form on the page, so I can access it at the 0th index
	    });
	  },


	  function() {	//Fourth Function: Writes the result to a file
	    var result = page.evaluate(function() {
	   		var data1 = document.getElementsByTagName('table')[4].outerHTML;	//This table includes the roll number and name
	   		var data2 = document.getElementsByTagName('table')[5].outerHTML;	//This table contains the actual marks and grades
	   		return data1 + data2;	//concatenate them
	    }, 'data');
	    	try {
	   			fs.write("result" + rollnos[rollindex] + ".html", result, 'w');	//write the whole thing to an html file.
	    	} catch(e) {
	       		 console.log(e);
	    	}
	  }
	];
	
	setInterval(function() {
	  	if (!loadInProgress && typeof steps[testindex] === "function" && rollindex < rollnos.length) {	
	  		if (testindex === 0) {
	  			console.log(rollnos[rollindex]);
	  		}
	    	console.log("step " + (testindex + 1));
	    	steps[testindex]();
	    	testindex++;
	  	}
	  	if (typeof steps[testindex] != "function") {
	   		console.log("test complete!");
	   		testindex = 0;
	   		rollindex++;
	 	}
	 	if (rollindex === rollnos.length) {
        	console.log("complete!");
        	phantom.exit();
   		}
	}, 50);


