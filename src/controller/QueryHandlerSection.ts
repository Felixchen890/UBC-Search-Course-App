import {InsightDataset, InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {CachedDataSection} from "./CachedDataSection";
import {CachedDataRoom} from "./CachedDataRoom";
import {WhereHandlerSection} from "./WhereHandlerSection";
import {OrderHandler} from "./OrderHandler";

import {TransformationHelper} from "./TransformationHelper";


export class QueryHandlerSection {
	private dataReport: InsightDataset[];
	private data: InsightResult[];
	private setID: string;
	private order: string;
	private query: any;
	private result: any[];
	private columns: any[];
	private resultData: InsightResult[];
	private resultDataTrans: InsightResult[][];
	private sectionKeyArray: any;

	constructor(query: any, reportSet: InsightDataset[], data: CachedDataSection[], id: any) {
		// dummy constructor
		this.query = query;
		this.dataReport = reportSet;
		this.setID = id;
		this.data = this.setTranslater(data);
		this.result = data;
		this.columns = [];
		this.order = "";
		this.resultData = this.setTranslater(data);
		this.resultDataTrans = [];
		this.sectionKeyArray = ["avg","pass","fail","audit","year","dept","id","instructor","title"
			,"uuid"];
	}

	// translate CachedDataSection into InsightResult that can be more easily referred later
	private setTranslater(data: CachedDataSection[]): InsightResult[]{
		let result = [];
		for(const cached of data){
			if(cached.setId === this.setID) {
				let obj: InsightResult = {
					dept: cached.dept,
					id: cached.id,
					avg: cached.avg,
					instructor: cached.instructor,
					title: cached.title,
					pass: cached.pass,
					fail: cached.fail,
					audit: cached.audit,
					uuid: cached.uuid,
					year: cached.year,
					setId: cached.setId	// might be useless
				};
				result.push(obj);
			}
		}
		return result;
	}

	public queryHelper() {
		let optionPart = this.query.OPTIONS;
		let wherePart = this.query.WHERE;
		if(Object.keys(wherePart).length === 0){
			let transformationPart = this.query["TRANSFORMATIONS"];
			if("TRANSFORMATIONS" in this.query){
				this.sectionTransformationHelper(optionPart, transformationPart);
				if(this.resultDataTrans.length > 5000){
					return Promise.reject(new ResultTooLargeError("result entry exceeds 5000 limit"));
				}
				let test = this.transDataResults();
				// todo
				if (Object.keys(this.columns).includes("ORDER")) {
					test = this.sortMethodv2(test);
				}
				return Promise.resolve(test);
			}else{
				this.extractedOptionHandler(optionPart);
				if(this.resultData.length > 5000){
					return Promise.reject(new ResultTooLargeError("result entry exceeds 5000 limit"));
				}
				return Promise.resolve(this.resultData);
			}

		}
		let whereHandler = new WhereHandlerSection(this.resultData);
		this.resultData = whereHandler.whereHandler(wherePart);
		let transformationPart = this.query["TRANSFORMATIONS"];
		if ("TRANSFORMATIONS" in this.query) {
			this.transformationSectionHelper(optionPart, transformationPart);
			if(this.resultDataTrans.length > 5000){
				return Promise.reject(new ResultTooLargeError("result entry exceeds 5000 limit"));
			}
			this.resultData = [];
			for(const results of this.resultDataTrans){
				this.resultData.push(results[0]);
			}
			let test = this.resultData;
			// todo
			if (Object.keys(this.columns).includes("ORDER")) {
				test = this.sortMethodv2(test);
			}
			return Promise.resolve(test);
		} else {
			this.extractedOptionHandler(optionPart);
			if(this.resultData.length > 5000){
				return Promise.reject(new ResultTooLargeError("result entry exceeds 5000 limit"));
			}
			return Promise.resolve(this.resultData);
		}
	}

	private transDataResults() {
		this.resultData = [];
		for (const results of this.resultDataTrans) {
			this.resultData.push(results[0]);
		}
		let test = this.resultData;
		return test;
	}

	private extractedOptionHandler(optionPart: any) {
		this.optionHandler(optionPart);
		this.resultData = this.resultHandler();
		this.order = this.query["OPTIONS"]["ORDER"];
		if (typeof this.order === "string") {
			this.resultData = this.sortHandler(this.resultData);
		} else if (typeof this.order === "object") {
			let orderHandler = new OrderHandler(this.resultData, this.order);
			this.resultData = orderHandler.sortByMultipleColumns();
		}
	}

	private extractedOptionHandlerv2(optionPart: any) {
		this.optionHandler(optionPart);
		this.resultData = this.resultHandler();
		this.order = this.query["OPTIONS"]["ORDER"];
		if (typeof this.order === "string") {
			return this.sortHandler(this.resultData);
		} else if (typeof this.order === "object") {
			let orderHandler = new OrderHandler(this.resultData, this.order);
			return orderHandler.sortByMultipleColumns();
		}
	}

	private sectionTransformationHelper(optionPart: any, transformationPart: any) {
		this.transformationOptionHandler(optionPart, transformationPart);
		let sectionTransformerHelper =
			new TransformationHelper(this.data, transformationPart, this.resultData);
		this.resultDataTrans = sectionTransformerHelper.helpTransform();
		// perform for loop on resultDataTrans to handle the result
		let resultsHandled: InsightResult[][] = [];
		for(let results of this.resultDataTrans){
			let current: InsightResult[] = this.transformationResultHandler(results);
			resultsHandled.push(current);
		}
		this.resultDataTrans = resultsHandled;
		let test = this.resultDataTrans;
		// current issue: resultdataset has exploded since the forming the result
		// refactor the code for sort and pass the tests
		this.sortMethodv1();
	}

	private sortMethodv1() {
		this.order = this.query["OPTIONS"]["ORDER"];
		if (typeof this.order === "string") {
			let finalResult: InsightResult[][] = [];
			for (let results of this.resultDataTrans) {
				let result: InsightResult[] = this.sortHandler(results);
				finalResult.push(result);
			}
			this.resultDataTrans = finalResult;
		} else if (typeof this.order === "object") {
			let orderHandler = new OrderHandler(this.resultData, this.order);
			this.resultData = orderHandler.sortByMultipleColumns();
		}
	}

	private sortMethodv2(test: any) {
		this.order = this.query["OPTIONS"]["ORDER"];
		if (typeof this.order === "string") {
			return this.extractedOptionHandlerv2(this.query["OPTIONS"]);
		} else if (typeof this.order === "object") {
			let orderHandler: any = new OrderHandler(this.resultData, this.order);
			return orderHandler.sortByMultipleColumns();
		}
	}

	private transformationSectionHelper(optionPart: any, transformationPart: any) {
		this.transformationOptionHandler(optionPart, transformationPart);
		let sectionTransformerHelper =
			new TransformationHelper(this.data, transformationPart, this.resultData);
		this.resultDataTrans = sectionTransformerHelper.helpTransform();
		// perform for loop on resultDataTrans to handle the result
		let resultsHandled: InsightResult[][] = [];
		for(let results of this.resultDataTrans){
			let current: InsightResult[] = this.transformationResultHandler(results);
			resultsHandled.push(current);
		}
		this.resultDataTrans = resultsHandled;
		let test = this.resultDataTrans;
		this.order = this.query["OPTIONS"]["ORDER"];
		if (typeof this.order === "string") {
			let finalResult: InsightResult[][] = [];
			for(let results of this.resultDataTrans){
				let result: InsightResult[] = this.sortHandler(results);
				finalResult.push(result);
			}
			this.resultDataTrans = finalResult;
		} else if (typeof this.order === "object") {
			let orderHandler = new OrderHandler(this.resultData, this.order);
			this.resultData = orderHandler.sortByMultipleColumns();
		}
	}

// modifies: the current helper's columns aspect, keeps track of what kind of data should we include in the result
	public optionHandler(optionPart: any) {
		let columnPart = optionPart["COLUMNS"];
		this.columns = [];
		for (const c of columnPart) {
			let splitv: string = c.split("_",2)[1];
			this.columns.push(splitv);
		}
	}

	public transformationOptionHandler(optionPart: any, transformationPart: any) {
		let columnPart = optionPart["COLUMNS"];
		this.columns = [];
		for (const c of columnPart) {
			if(c.toString().includes("_")){
				let splitv: string = c.split("_",2)[1];
				this.columns.push(splitv);
			}else{
				this.columns.push(c.toString());
			}
		}
	}


	private resultHandler(): InsightResult[]{
		let handledResults: InsightResult[] = [];
		for(const result of this.resultData){
			let handledResult: InsightResult = {};
			for(const column of this.columns){
				handledResult[`${this.setID}_${column}`] = result[column];
			}
			handledResults.push(handledResult);
		}
		return handledResults;
	}

	private transformationResultHandler(resultsList: InsightResult[]) {
		let handledResults: InsightResult[] = [];
		for (let result of resultsList){
			let handledResult: InsightResult = {};
			for(const column of this.columns){
				if (this.sectionKeyArray.includes(column)) {
					handledResult[`${this.setID}_${column}`] = result[column];
				} else {
					handledResult[column] = result[column];
				}
			}
			handledResults.push(handledResult);
		}
		return handledResults;
	}

	private sortHandler(results: InsightResult[]): InsightResult[] {
		let setId = this.setID;
		let sortedResult = results;
		// check if this query has no order, if there is no order specified, return as pruned result
		if(this.order === undefined){
			return results;
		}
		let orderKey = this.order.split("_", 2)[1];
		if (orderKey === "avg" || orderKey === "pass" ||
			orderKey === "fail" || orderKey === "audit" || orderKey === "year"){
			// How to sort an array of integers correctly
			// https://stackoverflow.com/questions/1063007/how-to-sort-an-array-of-integers-correctly
			sortedResult = results.sort(function (a, b){
				let valA: any = a[`${setId}_${orderKey}`];
				let valB: any = b[`${setId}_${orderKey}`];
				return valA - valB;
			});
		} else if (orderKey === "dept" || orderKey === "id" ||
			orderKey === "instructor" || orderKey === "uuid" || orderKey === "title") {
			// How to sort an array alphabetically inspired from
			// https://www.w3schools.com/jsref/jsref_localecompare.asp#:~:text=The%20localeCompare()%20method%20compares,language%20settings%20of%20the%20browser.
			sortedResult = results.sort(function (a, b) {
				let valA: any = a[`${setId}_${orderKey}`];
				let valB: any = b[`${setId}_${orderKey}`];
				return valA.localeCompare(valB);
			});
		}else {
			return sortedResult;
		}
		return sortedResult;
	}
}
