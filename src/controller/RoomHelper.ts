import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import {CachedDataRoom} from "./CachedDataRoom";
import JSZip from "jszip";
import {parse} from "parse5";
import * as http from "http";
import {AddHelperRoom} from "./AddHelperRoom";

export class RoomHelper{

	constructor() {
		// console.log("Initiated RoomHelper");
	}

	public async addRooms(id: string, content: string, kind: InsightDatasetKind, cached: CachedDataRoom[],
						  data: InsightDataset[], ids: string[]): Promise<string[]> {
		const zip = new JSZip();
		let listOfRow: object[] = [];
		let testDocument: any;
		await (await zip.loadAsync(content, {base64: true})).file("index.htm")?.
			async("string").then(function(htmlContent){
				let document: object = parse(htmlContent);
				testDocument = document;
			});
		// todo: ask in ta OH whether this is the correct way of doing so!
		if(zip.folder("/campus\\/discover\\/buildings-and-classrooms\\//i")?.length === 0 ||
			zip.file("index.htm") === null){
			return Promise.reject(new InsightError("invalid dataset!"));
		}
		listOfRow = this.dFSTableHelper(testDocument);
		// use row reader to get the information in each row
		let infoInRows: any[] = this.rowsReader(listOfRow);
		let waiter: Array<Promise<any> | undefined> = [];
		for(let info of infoInRows){
			let path: string = info.link.toString().substring(2);
			if(zip.file(path) !== null){
				waiter.push(zip.file(path)?.async("string"));
			}
		}
		let listOfFile = await Promise.all(waiter);
		let listOfHtml: any[] = [];
		for(let file of listOfFile){
			let html: object = parse(file);
			listOfHtml.push(html);
		}
		let blackList: any[] = [];
		let geoPromises: Array<Promise<{lat: number, lon: number} | {error: any}> | undefined> = [];
		for(const info of infoInRows){
			let curAddress = this.refineString(info.address);
			let curLink = info.link;
			geoPromises.push(this.getGeoLocation(curAddress, curLink, blackList));
		}
		let geoLocations = await Promise.all(geoPromises);
		for(let i = 0; i < geoLocations.length; i++){
			if(infoInRows[i].link in blackList){
				continue;
			}
			this.getRooms(infoInRows[i], cached, geoLocations[i], listOfHtml[i], id, ids);
		}
		if(cached.length === 0){
			return Promise.reject(new InsightError("invalid dataset!"));
		}
		let helper = new AddHelperRoom(ids);
		return helper.writeFilesAndCache(cached, id, kind, data);
	}

	// receive the root of the parsed html tree, return list of rows with
	private dFSTableHelper(document: object): object[] {
		let toDo: object[] = [document];
		let result: object[] = [];
		while (toDo.length !== 0){
			let cur: any = toDo.pop();
			if(cur === null){
				continue;
			}
			if(cur["nodeName"] === "tr"){
				result.push(cur);
			}else{
				if(cur["childNodes"] === undefined){
					continue;
				}
				for(const child of cur["childNodes"]){
					toDo.push(child);
				}
			}
		}
		return result;
	}

	private rowsReader(listOfRow: any[]): object[]{
		let infoInRows = [];
		for(let curRow in listOfRow){
			let row = listOfRow[curRow];
			const curInfo: any = this.rowHelper(row);
			if(curInfo.link === undefined || curInfo.address === undefined
				|| curInfo.name === undefined || curInfo.code === undefined){
				continue;
			}
			infoInRows.push(curInfo);
		}
		return infoInRows;
	}

	private rowHelper(row: any): object{
		let child = row["childNodes"];
		let rowCode;
		let rowLink;
		let rowAddress;
		let rowName;
		// find the link and address from the row with two keywords
		let nameKey = "views-field views-field-field-building-code";
		let linkKey = "views-field views-field-title";
		let addressKey = "views-field views-field-field-building-address";
		for(let node of child){
			if(node["nodeName"] === "td"){
				// found a table element, check its attribute
				if(node["attrs"][0].value === linkKey){
					rowLink = this.getContent(node["childNodes"], "a");
					rowName = this.getBuildingName(node["childNodes"]);
				}
				if(node["attrs"][0].value === addressKey){
					rowAddress = this.getContent(node["childNodes"], "#text");
				}
				if(node["attrs"][0].value === nameKey){
					rowCode = this.getContent(node["childNodes"], "#text");
				}
			}
		}
		let rowBuilding = {
			code: rowCode,
			name: rowName,
			link: rowLink,
			address: rowAddress
		};
		return rowBuilding;
	}

	private getBuildingName(children: any[]): any{
		let result;
		for(const element of children){
			if(element["nodeName"] === "a"){
				for(const ele of element["childNodes"]){
					if(ele["nodeName"] === "#text"){
						result = ele["value"];
					}
				}
			}
		}
		return result;
	}

	private getContent(children: any[], key1: string): any {
		let result;
		for(let element in children){
			let cur = children[element];
			if(cur["nodeName"] === key1){
				// found a node with name of key 1 (either "a" or "#text")
				if(key1 === "a"){
					const attrs = cur["attrs"];
					for(const attr in attrs){
						let curAttr = attrs[attr];
						if(curAttr["name"] === "href"){
							result = curAttr["value"];
							return result;
						}
					}
				}
				if(key1 === "#text"){
					result = cur["value"];
					return result;
				}
			}
		}
		return result;
	}

	private getRooms(info: any, cachedRooms: CachedDataRoom[], geoLoc: any, curRoot: any, id: string, ids: string[]) {
		const curName = this.refineString(info.name);
		const curAddress = this.refineString(info.address);
		const curCode = info.code;
		let listOfRowsBuilding = this.dFSTableHelper(curRoot);
		let infoInRowsBuilding = this.rowsReaderBuilding(listOfRowsBuilding, curName, curAddress, curCode, geoLoc);
		let helper = new AddHelperRoom(ids);
		// info of rooms in current building in infoInRowsBuilding, add them into the cachedRooms and pass them back
		helper.processAndAddRooms(infoInRowsBuilding, cachedRooms, id);
	}

	private refineString(strObj: any): string{
		const str = strObj.toString();
		if(str[0] !== "/"){
			return str.trim();
		}
		let result = str.substring(3);
		result = result.trim();
		return result;
	}

	private rowsReaderBuilding(listOfRowsBuilding: object[], buildingName: string,
									 buildingAddress: string, buildingCode: string, geoLoc: any): object[] {
		let result: object[] = [];
		let lat = geoLoc.lat;
		let lon = geoLoc.lon;
		let location = {lat: lat, lon: lon};
		for (const row of listOfRowsBuilding) {
			let curRoom = this.rowsReaderBUildingHelper(row, buildingName, location, buildingCode, buildingAddress);
			if (curRoom.link === undefined || curRoom.capacity === undefined || curRoom.type === undefined
				|| curRoom.number === undefined || curRoom.furniture === undefined) {
				continue;
			}
			// at this point, info of room is finished, get the geolocation of the building
			result.push(curRoom);
		}
		return result;
	}

	private rowsReaderBUildingHelper(row: any, buildingName: string, geoLocation: any, code: string, address: string) {
		let elements = row["childNodes"];
		let lCode = this.refineString(code);
		let geoLoc = geoLocation;
		let roomNumber;
		let roomCapacity;
		let roomFurniture;
		let roomType;
		let roomLink;
		let rNumKey = "views-field views-field-field-room-number";
		let rCapacityKey = "views-field views-field-field-room-capacity";
		let rFurnitureKey = "views-field views-field-field-room-furniture";
		let rTypeKey = "views-field views-field-field-room-type";
		for(const element of elements){
			if(element["nodeName"] === "td"){
				// found a table element, check its attribute
				if(element["attrs"][0].value === rNumKey){
					roomLink = this.getContent(element["childNodes"], "a");
					roomNumber = this.getBuildingName(element["childNodes"]);
				}
				if(element["attrs"][0].value === rCapacityKey){
					roomCapacity = this.getContent(element["childNodes"], "#text");
					roomCapacity = this.refineString(roomCapacity);
				}
				if(element["attrs"][0].value === rFurnitureKey){
					roomFurniture = this.getContent(element["childNodes"], "#text");
					roomFurniture = this.refineString(roomFurniture);
				}
				if(element["attrs"][0].value === rTypeKey){
					roomType = this.getContent(element["childNodes"], "#text");
					roomType = this.refineString(roomType);
				}
			}
		}
		let resultRoom = {
			locCode: lCode,
			locName: buildingName,
			locAddress: address,
			location: geoLoc,
			number: roomNumber,
			capacity: roomCapacity,
			furniture: roomFurniture,
			type: roomType,
			link: roomLink
		};
		return resultRoom;
	}

	private getGeoLocation(buildingAddress: string, link: any, blackList: any[]) {
		const address: string = buildingAddress.replaceAll(" ", "%20");
		let url = `http://cs310.students.cs.ubc.ca:11316/api/v1/project_team097/${address}`;
		// http.get method usage from example provided on documentation of node
		// https://nodejs.org/api/http.html#httpgeturl-options-callback
		try{
			let res = new Promise<{lat: number, lon: number}>(function (resolve, reject){
				http.get(url, function (result) {
					let resultData = "";
					result.on("data", function (chunk){
						resultData += chunk;
					});
					result.on("end", function (){
						resolve(JSON.parse(resultData));
					});
				}).on("error", function (e){
					blackList.push(link);
					reject(e);
				});
			});
			return res;
		}catch(e){
			// do nothing
			return undefined;
		}
	}
}
