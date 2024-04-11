import {CachedDataRoom} from "./CachedDataRoom";
import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import * as fs from "fs-extra";

export class AddHelperRoom{
	private prevDataSetNames: string[];

	constructor(prevSets: string[]) {
		this.prevDataSetNames = prevSets;
	}

	public processAndAddRooms(infoInRowsBuilding: any[], cachedRooms: CachedDataRoom[], id: string) {
		for(const room of infoInRowsBuilding){
			// do something
			let fullName = room.locName;
			let shortName = room.locCode;
			let roomNumber = room.number;
			let roomName = `${shortName}_${roomNumber}`;
			let roomAddress = room.locAddress;
			let roomLat = room.location.lat;
			let roomLon = room.location.lon;
			let roomSeats = room.capacity;
			let roomType = room.type;
			let roomFurniture = room.furniture;
			let roomHref = room.link;
			let curCachedRoom: CachedDataRoom = {
				fullname: fullName,
				shortname: shortName,
				number: roomNumber,
				name: roomName,
				address: roomAddress,
				lat: roomLat,
				lon: roomLon,
				seats: Number(roomSeats),
				type: roomType,
				furniture: roomFurniture,
				href: roomHref,
				setID: id
			};
			cachedRooms.push(curCachedRoom);
		}
	}

	public writeFilesAndCache(cachedRooms: CachedDataRoom[], id: string,
							  kind: InsightDatasetKind, data: InsightDataset[]): Promise<string[]> {
		let result: string[] = [];
		let jsonStringObject: string = JSON.stringify({data: cachedRooms});
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
			numRows: cachedRooms.length
		};
		data.push(setToBeAdded);
		this.prevDataSetNames.push(id);
		result = this.prevDataSetNames;
		return Promise.resolve(result);
	}
}
