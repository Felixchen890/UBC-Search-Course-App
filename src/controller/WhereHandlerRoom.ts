import {InsightDataset, InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {CachedDataSection} from "./CachedDataSection";
import {CachedDataRoom} from "./CachedDataRoom";

export class WhereHandlerRoom {
	private resultData: any;

	constructor(resultData: InsightResult[]) {
		this.resultData = resultData;
	}

	public whereHandler(wherePart: any): InsightResult[] {
		let results: InsightResult[] = [];
		if (Object.keys(wherePart)[0] === "NOT") {
			results = this.notHandler(wherePart[Object.keys(wherePart)[0]]);
		}else if(Object.keys(wherePart)[0] === "AND" || Object.keys(wherePart)[0] === "OR"){
			results = this.logicHandler(wherePart[Object.keys(wherePart)[0]], Object.keys(wherePart)[0]);
		}else if(Object.keys(wherePart)[0] === "IS"){
			results = this.isHandler(wherePart.IS);
		}else{
			results = this.keyHandler(wherePart);
		}
		return results;
	}

	private notHandler(notPart: any): InsightResult[] {
		let returnedArray: InsightResult[] = this.whereHandler(notPart);
		let sections: InsightResult[] = [];
		// possible bug here - checked!
		for (const section of this.resultData) {
			sections.push(section);
		}
		returnedArray = sections.filter((x) => {
			// array filter method
			// https://www.programiz.com/javascript/library/array/filter
			if (!returnedArray.includes((x))) {
				return true;
			} else {
				return false;
			}
		});
		return returnedArray;
	}

	// AND and OR should take more than two
	private logicHandler(logicPart: any[], logicOperation: string): InsightResult[]{
		let returnedArr: InsightResult[] = [];
		if (logicOperation === "AND") {
			returnedArr = this.whereHandler(logicPart[0]);
			for(let logic of logicPart){
				let eachPartFilter: InsightResult[] = this.whereHandler(logic);
				returnedArr = returnedArr.filter(function (insight){
					return eachPartFilter.includes(insight);
				});
			}
		} else if (logicOperation === "OR") {
			for (let logic of logicPart) {
				// js array concat
				// https://www.w3schools.com/jsref/jsref_concat_array.asp
				let eachPartFilter: InsightResult[] = this.whereHandler(logic).concat(returnedArr);
				for (let e of eachPartFilter) {
					returnedArr.push(e);
				}
			}
			let setVerArr = new Set(returnedArr);
			returnedArr = Array.from(setVerArr);
			return returnedArr;
		}
		return returnedArr;
	}

	private keyHandler(wherePart: any): InsightResult[]{
		let curKey = Object.keys(wherePart)[0];
		if(curKey === "LT"){
			return this.ltHandler(wherePart.LT);
		}else if(curKey === "EQ"){
			return this.eqHandler(wherePart.EQ);
		}else{
			return this.gtHandler(wherePart.GT);
		}
	}

	private ltHandler(ltPart: any): InsightResult[]{
		let returnedArray: InsightResult[] = [];
		for (const section of this.resultData) {
			if (ltPart[Object.keys(ltPart)[0]] > section[Object.keys(ltPart)[0].split("_")[1]]) {
				returnedArray.push(section);
			}
		}
		return returnedArray;
	}

	private eqHandler(eqPart: any): InsightResult[]{
		let returnedArray: InsightResult[] = [];
		for (const section of this.resultData) {
			if (eqPart[Object.keys(eqPart)[0]] === section[Object.keys(eqPart)[0].split("_")[1]]) {
				returnedArray.push(section);
			}
		}
		return returnedArray;
	}

	private gtHandler(gtPart: any): InsightResult[]{
		let returnedArray: InsightResult[] = [];
		for (const section of this.resultData) {
			// string split method
			// https://www.w3schools.com/jsref/jsref_split.asp
			if (gtPart[Object.keys(gtPart)[0]] < section[Object.keys(gtPart)[0].split("_")[1]]) {
				returnedArray.push(section);
			}
		}
		return returnedArray;
	}

	private isHandler(isPart: any): InsightResult[]{
		let skey1 = Object.keys(isPart)[0];
		let skey2 = skey1.split("_")[1];
		let skeyResult = isPart[skey1];
		let numAsterisk = this.getNumAsterisk(skeyResult);
		let result: InsightResult[] = [];
		if (numAsterisk === 0) {
			for(const section of this.resultData){
				if(section[skey2] === skeyResult){
					result.push(section);
				}
			}
			return result;
		} else if (numAsterisk === 1) {
			if (skeyResult[0] === "*") {
				for(const section of this.resultData){
					// string endsWith method
					// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
					if(section[skey2].toString().endsWith(skeyResult.split("*")[1])){
						result.push(section);
					}
				}
				return result;
			} else {
				for(const section of this.resultData){
					// string startsWith method
					// https://www.w3schools.com/jsref/jsref_startswith.asp
					if(section[skey2].toString().startsWith(skeyResult.split("*")[0])){
						result.push(section);
					}
				}
				return result;
			}
		} else{
			for(const section of this.resultData){
				// string includes method
				// https://www.w3schools.com/jsref/jsref_includes.asp
				if(section[skey2].toString().includes(skeyResult.split("*")[1])){
					result.push(section);
				}
			}
			return result;
		}
	}

	private getNumAsterisk(result: string): number{
		let count: number = 0;
		for(let i = 0; i < result.length; i++){
			if(result.charAt(i) === "*"){
				count++;
			}
		}
		return count;
	}
}
