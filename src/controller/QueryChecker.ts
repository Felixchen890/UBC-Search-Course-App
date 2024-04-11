import {InsightDataset, InsightError} from "./IInsightFacade";
import {QueryDecomposer} from "./QueryDecomposer";
import {CheckTransformations} from "./checkTransformations";
import {CheckOptions} from "./CheckOptions";

export class QueryChecker {

	private sectionDatasetIDs: any[];
	private roomDatasetIDs: any[];
	private data: InsightDataset[];
	public id: any = "";
	constructor(sectionDatasetIDs: any[], roomDatasetIDs: any[]) {
		this.sectionDatasetIDs = sectionDatasetIDs;
		this.roomDatasetIDs = roomDatasetIDs;
		this.data = [];
	}

	public checkQuery(query: unknown){
		if (this.isRecord(query)) {
			let where = query["WHERE"];
			let options: any = query["OPTIONS"];
			let columns = options["COLUMNS"];
			let checkTransformations = new CheckTransformations(query["TRANSFORMATIONS"],
				this.sectionDatasetIDs,columns);
			if(Object.keys(query).length !== 2 && Object.keys(query).length !== 3) {
				throw new InsightError("query is not valid, check query length");
			}
			if(!Object.keys(query).includes("WHERE")) {
				throw new InsightError("query is not valid, check query where part");
			}
			if (!Object.keys(query).includes("OPTIONS")) {
				throw new InsightError("query is not valid, check query option part");
			}
			if (Object.keys(query).includes("TRANSFORMATIONS")) {
				checkTransformations.handleTransformations();
			}
			let checkOptions = new CheckOptions(options,this.sectionDatasetIDs,this.roomDatasetIDs);
			checkOptions.handleOptions(options);
			this.handleWHERE(where);
			let queryDecomposer = new QueryDecomposer(query);
			this.id = queryDecomposer.getId();
		} else {
			throw new InsightError("invalid query");
		}
	};

	private handleWHERE(wherePart: any){
		if(Object.keys(wherePart).length === 0){
			return;
		}
		if (Object.keys(wherePart).length > 1) {
			throw new InsightError("query is not valid, wherepart exceeds length of 1");
		}
		if (typeof wherePart !== "object") {
			throw new InsightError("typeof wherePart not object");
		}
		const filterArguments = ["IS","NOT","AND","OR","LT","GT","EQ"];
		let keyName = Object.keys(wherePart)[0];
		if (!filterArguments.includes(keyName)) {
			throw new InsightError("query is not valid, check filter argument");
		}
		if (Object.keys(wherePart)[0] === "AND" || Object.keys(wherePart)[0] === "OR") {
			this.handleLogicComparison(wherePart[keyName]);
		}
		if (Object.keys(wherePart)[0] === "GT" || Object.keys(wherePart)[0] === "LT"
			|| Object.keys(wherePart)[0] === "EQ") {
			this.handleMComparison(wherePart[keyName]);
		}
		if (Object.keys(wherePart)[0] === "IS") {
			this.handleISComparison(wherePart[keyName]);
		}
		if (Object.keys(wherePart)[0] === "NOT") {
			this.handleNotComparison(wherePart[keyName]);
		}
	};

	private handleLogicComparison(logicPart: any){
		for (let elements of logicPart) {
			this.handleWHERE(elements);
		}
		if (logicPart.length === 0) {
			throw new InsightError("OR part length is 0");
		}
	}

	private handleMComparison(mPart: any) {
		if (typeof mPart !== "object") {
			throw new InsightError("query is not valid, in handleMcomparison, mPart is not an object");
		}
		if (Object.keys(mPart).length !== 1) {
			throw new InsightError("query is not valid, in handleMcomparison, mpart length is not 1");
		}
		if (this.mKeyHandler(mPart)) {
			throw new InsightError("query is not valid, Mkey value check failed");
		}
	}

	private mKeyHandler(mPart: any): boolean{
		let mKey = Object.keys(mPart)[0];
		if (!mKey.includes("_")) {
			return false;
		}
		let mKeyValue = mPart[mKey];
		return !this.checkMkey(Object.keys(mPart)[0]) || !this.checkMkeyValue(mKeyValue);
	}

	private checkMkeyValue(mKeyValue: any){
		return typeof mKeyValue === "number";
	}

	private checkMkey(mKey: string): boolean{
		let mKeyArray = [];
		for (const c of this.sectionDatasetIDs) {
			mKeyArray.push(c + "_avg");
			mKeyArray.push(c + "_pass");
			mKeyArray.push(c + "_fail");
			mKeyArray.push(c + "_audit");
			mKeyArray.push(c + "_year");
		}
		for (const c of this.roomDatasetIDs) {
			mKeyArray.push(c + "_lat");
			mKeyArray.push(c + "_lon");
			mKeyArray.push(c + "_seats");
		}
		return mKeyArray.includes(mKey);
	}

	private handleISComparison(isPart: any) {
		if (typeof isPart !== "object" && isPart !== null && isPart !== undefined) {
			throw new InsightError("query is not valid, isPart type wrong");
		}

		if (Object.keys(isPart).length !== 1) {
			throw new InsightError("query is not valid, isPart length wrong");
		}
		if (this.isKeyHandler(isPart)) {
			throw new InsightError("query is not valid, isKey value check failed");
		}
	}

	private isKeyHandler(isPart: any){
		let isKey = Object.keys(isPart)[0];
		if (Object.keys(isPart)[0] === "NOT") {
			return true;
		}
		if (!isKey.includes("_")) {
			return false;
		};
		let isKeyValue = isPart[Object.keys(isPart)[0]];
		return !this.checkIskey(Object.keys(isPart)[0]) || !this.checkIsKeyValue(isKeyValue);
	}

	private checkIsKeyValue(isKeyValue: string){
		if (isKeyValue.includes("*")) {
			if (this.getNumAsterisk(isKeyValue) !== 1 && this.getNumAsterisk(isKeyValue) !== 0 &&
				this.getNumAsterisk(isKeyValue) !== 2) {
				return false;
			}
			if (this.getNumAsterisk(isKeyValue) === 1) {
				if (isKeyValue[0] !== "*" && isKeyValue[isKeyValue.length - 1] !== "*") {
					return false;
				}
			}
		}
		return true;
	}

	private checkIskey(isKey: string) {
		let isKeyArray = [];
		for (const c of this.sectionDatasetIDs) {
			isKeyArray.push(c + "_dept");
			isKeyArray.push(c + "_id");
			isKeyArray.push(c + "_instructor");
			isKeyArray.push(c + "_title");
			isKeyArray.push(c + "_uuid");
		}
		for (const c of this.roomDatasetIDs) {
			isKeyArray.push(c + "_fullname");
			isKeyArray.push(c + "_shortname");
			isKeyArray.push(c + "_number");
			isKeyArray.push(c + "_name");
			isKeyArray.push(c + "_address");
			isKeyArray.push(c + "_type");
			isKeyArray.push(c + "_furniture");
			isKeyArray.push(c + "_href");
		}
		return isKeyArray.includes(isKey);
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

	private handleNotComparison(notPart: any) {
		try {
			this.handleWHERE(notPart);
		} catch (e) {
			throw new InsightError("notPart is wrong");
		}
	}

	public  isRecord(query: unknown): query is Record<string,unknown> {
		if (typeof query !== "object" && query !== null && query !== undefined) {
			return false;
		} else {
			return true;
		}
	}
}
