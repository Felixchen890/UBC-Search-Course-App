import {CachedDataSection} from "./CachedDataSection";

export default class AddHelperSection {
	public static dataProcessorAdd (dataResult: any[], listOfData: any[],
		cachedDataSet: CachedDataSection[], id: string){
		for(let data of dataResult){
			if(this.isNotCorruptedData(data)){
				let start = 0;
				if(data["Section"] !== "overall"){
					start = Number(data["Year"]);
				}else{
					start = 1900;
				}
				let uuid = data["id"].toString();
				let added: CachedDataSection = {
					dept: data["Subject"],
					id: data["Course"],
					avg: data["Avg"],
					instructor: data["Professor"],
					title: data["Title"],
					pass: data["Pass"],
					fail: data["Fail"],
					audit: data["Audit"],
					uuid: uuid,
					year: start,
					setId: id
				};
				listOfData.push(added);
				cachedDataSet.push(added);
			}
		}
	}

	private static isNotCorruptedData(data: any): boolean {
		if(data["Section"] === null || data["id"] === null || data["Subject"] === null
			|| data["Course"] === null || data["Avg"] === null || data["Professor"] === null
			|| data["Title"] === null || data["Pass"] === null || data["Fail"] === null
			|| data["Audit"] === null || data["Year"] === null){
			return false;
		}
		return true;
	}
}
