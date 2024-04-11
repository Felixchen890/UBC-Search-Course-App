import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import JSZip from "jszip";
import * as fs from "fs-extra";
import AddHelperSection from "./AddHelperSection";

import {CachedDataSection} from "./CachedDataSection";

import {QueryChecker} from "./QueryChecker";
import {RoomHelper} from "./RoomHelper";
import {CachedDataRoom} from "./CachedDataRoom";
import {QueryHandlerSection} from "./QueryHandlerSection";
import {CheckQueryType} from "./CheckQueryType";
import {QueryHandlerRoom} from "./QueryHandlerRoom";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	// declaration of class field
	// cachedDataSet: array of cachedData
	// : defined in CachedDataSection.ts, represents a section with all its information
	public data: InsightDataset[] = [];
	public datasetIds: any[] = [];
	private sectionDatasetIds: any[] = [];
	private roomDatasetIds: any[] = [];
	public cachedDataSections: CachedDataSection[] = [];
	public cachedDataRooms: CachedDataRoom[] = [];

	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	// todo: add the cachedDataset from addHelper to this.cachedDataSet
	// treat add dataset like a carrying job, after we put content inside, we need to submit a report for what is carried and what is not
	// the report is in form of Promise<string[]> in this case
	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// check two condition on id: it is a string of requirement and is not full white space string
		if(!(/^[^_]+$/.test(id))){
			return Promise.reject(new InsightError("invalid id input, check underscore in id"));
		}else if(this.isWhiteSpaceOnly(id)){
			return Promise.reject(new InsightError("white space id error"));
		}else if(this.hasDuplicate(id)){
			return Promise.reject(new InsightError("dataset with same id existed"));
		}
		if(kind === InsightDatasetKind.Rooms){
			let helper = new RoomHelper();
			return helper.addRooms(id, content, kind, this.cachedDataRooms, this.data, this.datasetIds);
		}
		return this.addSection(id, content, kind);
	}

	// check whether the id given exist in the dataset list
	private hasDuplicate(id: string): boolean{
		for(const set of this.data){
			if(set.id === id){
				return true;
			}
		}
		return false;
	}

	// check whether the id is only white space
	private isWhiteSpaceOnly(id: string): boolean {
		for(let i = 0; i < id.length; i++){
			if(id.charAt(i) !== " "){
				return false;
			}
		}
		return true;
	}

	// helper function for adding sections
	private async addSection(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		let sections = new JSZip();
		// list of data: the list of data that is going to be written into local disks
		let listOfData: object[] = [];
		// list of promises: the list of promise<string> for intermediate holder of content: unicode string to list of promise
		let listOfPromise: Array<Promise<string>> = [];
		await (await sections.loadAsync(content, {base64: true})).folder("courses");
		sections.forEach(function (relativePath, file){
			listOfPromise.push(file.async("string"));
		});
		// from arr of promise to arr of str (with content inside)
		let arrFile: string[] = await Promise.all(listOfPromise);
		// ready object for adding
		for(let file of arrFile){
			try{
				// check whether file is valid to push into list of data
				let curObj = JSON.parse(file);
				let pushingObj = curObj["result"];
				// console.log(pushingObj);
				// don't need to process empty data file
				if(pushingObj.length === 0){
					continue;
				}
				// for(const section of pushingObj) {
				//
				// }
				AddHelperSection.dataProcessorAdd(pushingObj, listOfData, this.cachedDataSections, id);
				// this.cachedDataSet = finalResult;
				// use add helper to get data to push
			}catch(e){
				// meet file that is either broken or doesn't match what we want, just continue to skip it
				// do nothing
			}
		}
		let jsonStringObject: string = JSON.stringify({data: listOfData});
		// usage of writeFileSync learned from examples on https://www.geeksforgeeks.org/node-js-fs-writefilesync-method/
		try{
			fs.createFileSync(`./data/${id}.json`);
			fs.writeFileSync(`./data/${id}.json`, jsonStringObject);
		}catch (e){
			// stop
		}
		let setToBeAdded: InsightDataset = {
			id: id,
			kind: kind,
			numRows: listOfData.length
		};
		this.data.push(setToBeAdded);
		this.datasetIds.push(id);
		return Promise.resolve(this.datasetIds);
	}

	private getIDs(): string[]{
		let idArr: string[] = [];
		for(let set of this.data){
			idArr.push(set.id);
		}
		return idArr;
	}


	public removeDataset(id: string): Promise<string> {
		let ids = this.getIDs();
		// step 1: check whether id is valid and the dataset to be removed exist in the structure
		if(!(/^[^_]+$/.test(id))){
			return Promise.reject(new InsightError("invalid id input, check underscore in id"));
		}else if(this.isWhiteSpaceOnly(id)){
			return Promise.reject(new InsightError("white space id error"));
		}else if(!ids.includes(id)){
			return Promise.reject(new NotFoundError("dataset doesn't exist in the facade"));
		}
		// step 2: delete the data (unlink locally) and toss it away from the data keeper in the structure
		let i = this.getIndex(id);
		// data persistence sync delete from https://www.geeksforgeeks.org/node-js-fs-unlinksync-method/
		try{
			fs.unlinkSync(`./data/${id}.json`);
		}catch(e){
			// stop
		}
		this.data.splice(i, 1);
		// idea of splicing cached data with specific traits comes from https://bobbyhadz.com/blog/typescript-remove-element-from-array#remove-an-object-from-an-array-in-typescript
		this.cachedDataSections.filter(function (data){
			return data.setId !== id;
		});
		// final: resolve with the id of the removed dataset
		return Promise.resolve(id);
	}

	private getIndex(id: string): number{
		let i = 0;
		for(let set of this.data){
			if(set.id !== id){
				i++;
			}else{
				// do nothing
			}
		}
		return i;
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		// set the datasetID to empty each time we perform a new query
		for (const c of this.data) {
			if (c.kind === "sections") {
				this.sectionDatasetIds.push(c.id);
			}
			if (c.kind === "rooms") {
				this.roomDatasetIds.push(c.id);
			}
		}
		let queryChecker = new QueryChecker(this.sectionDatasetIds,this.roomDatasetIds);
		if (typeof query !== "object" || query === null || query === undefined) {
			return Promise.reject(new InsightError("query is not valid"));
		}
		try {
			queryChecker.checkQuery(query);
		} catch (e) {
			return Promise.reject(e);
		}
		// initiate new helper class (find the kind of query we are dealing with)
		// input: query
		// output: string, either "room" or "section"
		// pass output into queryHandler to determine which handler we should use
		if (queryChecker.isRecord(query)) {
			let optionPart: any = query["OPTIONS"];
			let columnPart = optionPart["COLUMNS"];
			let checkQueryType = new CheckQueryType(columnPart);
			if (checkQueryType.typeCheck() === "sections") {
				let id = queryChecker.id;
				let queryHandler = new QueryHandlerSection(query, this.data, this.cachedDataSections, id);
				return queryHandler.queryHelper();
			} else {
				let id = queryChecker.id;
				let queryHandlerRoom = new QueryHandlerRoom(query, this.data, this.cachedDataRooms, id);
				return queryHandlerRoom.queryHelper();
			}
		} else {
			let id = queryChecker.id;
			let queryHandler = new QueryHandlerSection(query, this.data, this.cachedDataSections, id);
			return queryHandler.queryHelper();
		}
	};

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(this.data);
	}
}
