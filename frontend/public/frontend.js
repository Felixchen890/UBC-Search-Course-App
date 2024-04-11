document.getElementById("prof-search-button").addEventListener("click", handleClickMe);
document.getElementById("grade-search-button").addEventListener("click", handleSearchNumber);
// http request needed, fetch library
function handleClickMe() {
	// this function will be in charge of the two search button on the html (either course side or room side)
	// input: only one input!!! (professor's name/ building's name)
	// assume the dataset is already added (the server was ready and initiated with two datasets
	// room, and pairs.zip)
	// procedure:
	// 2. call http to pass query string to server to perform query
	// 3. after the query return, use the result (resolved promise) to form the table of results (or error message when
	// 	  necessary)
	// finished procedure

	let name1 = document.getElementById('professorName').value.toLowerCase();
	let dept = document.getElementById('professorDept').value.toLowerCase();
	let query = formQueryStringName(name1, dept);
	handleRequest(query);
}

function handleSearchNumber(){
	// this function will be in charge of the two search button with two input (average/capacity)
	// with one of Greater than, equals to or less than. perform query on the input of that
	// assume that the data is already added to the set
	// procedure:
	// 0. check whether there is input, form error message when there is none
	// 1. form the query string with the input (use formQueryStringGrade helper)
	// 2. call http to pass query string to server to perform query
	// 3. after the query return, use the result (resolved promise) to form the table of results (or error message when
	// 	  necessary)
	// finished procedure

	let average = Number(document.getElementById('course-average').value);
	let select = document.getElementById('relation');
	let relationship = select.value;
	let query = formQueryStringGrade(average, relationship);
	handleRequest(query);
}

function handleRequest(query){
	let request = new XMLHttpRequest();
	request.onreadystatechange = function (){
		// to do
		if(request.readyState === request.DONE){
			console.log(request.responseText);
			const res = JSON.parse(request.responseText);
			const error = document.getElementById("err-message");
			const tableVal = res["result"];
			if(tableVal === undefined){
				error.innerText = res["error"];
				document.getElementById("table-returned").innerHTML = ``;
			}else{
				if(tableVal.length === 0){
					error.innerText = "There is no result on the keyword, please try again!";
					document.getElementById("table-returned").innerHTML = ``;
				}else{
					error.innerText = "";
					const table = document.getElementById("table-returned");
					let html = "";
					html += `<tr>
								<td>Department</td>
								<td>ID</td>
								<td>Average</td>
								<td>Instructor</td>
								<td>Year</td>
							</tr>`;
					for(const insight of tableVal){
						html += `<tr>
								<td>${insight["sections_dept"]}</td>
								<td>${insight["sections_id"]}</td>
								<td>${insight["sections_avg"]}</td>
								<td>${insight["sections_instructor"]}</td>
								<td>${insight["sections_year"]}</td>
							</tr>`;
					}
					table.innerHTML = html;
				}
			}
		}
	};
	request.open("POST", "http://localhost:4321/query", true);
	request.setRequestHeader("Content-Type", "application/json");
	request.send(JSON.stringify(query));
}

function formQueryStringName(name, dept){
	let inputQuery = {
		"WHERE": {
			"AND": [
				{
					"IS": {
						"sections_instructor": name
					}
				},
				{
					"IS": {
						"sections_dept": dept
					}
				}
			]
		},
		"OPTIONS": {
			"COLUMNS": [
				"sections_dept",
				"sections_avg",
				"sections_instructor",
				"sections_id",
				"sections_year"
			],
			"ORDER": "sections_year"
		}
	};
	return inputQuery;
}

function formQueryStringGrade(capacity, flag){
	if(flag === "Greater Than"){
		let inputQuery = {
			"WHERE": {
				"GT": {
					"sections_avg": capacity
				}
			},
			"OPTIONS": {
				"COLUMNS": [
					"sections_dept",
					"sections_avg",
					"sections_instructor",
					"sections_id",
					"sections_year"
				],
				"ORDER": "sections_year"
			}
		}
		return inputQuery;
	}else if (flag === "Equals To"){
		let inputQuery = {
			"WHERE": {
				"EQ": {
					"sections_avg": capacity
				}
			},
			"OPTIONS": {
				"COLUMNS": [
					"sections_dept",
					"sections_avg",
					"sections_instructor",
					"sections_id",
					"sections_year"
				],
				"ORDER": "sections_year"
			}
		}
		return inputQuery;
	}else{
		let inputQuery = {
			"WHERE": {
				"LT": {
					"sections_avg": capacity
				}
			},
			"OPTIONS": {
				"COLUMNS": [
					"sections_dept",
					"sections_avg",
					"sections_instructor",
					"sections_id",
					"sections_year"
				],
				"ORDER": "sections_year"
			}
		}
		return inputQuery;
	}
}
