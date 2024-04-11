import {InsightResult} from "./IInsightFacade";

export class OrderHandler {
	public resultData: InsightResult[];
	public dir: any;
	public orderKeys: any;
	public order: any;
	public keysLength: any;

	constructor(resultData: InsightResult[], order: any) {
		this.resultData = resultData;
		this.order = order;
		this.dir = order["dir"];
		this.orderKeys = order["keys"];
		this.keysLength = this.orderKeys.length;
	}


	public sortByMultipleColumns(): InsightResult[]{
		let startIndex = 0;
		let keysLength = this.orderKeys.length;
		if (this.dir === "UP") {
			return this.resultData.sort((x, y) => {
				return this.sortByMultipleColumnsUpHelper(x,y,this.orderKeys,0);
			});
		}else{
			return this.resultData.sort((x, y) => {
				return this.sortByMultipleColumnsDownHelper(x,y,this.orderKeys,0);
			});
		}
	}

	public sortByMultipleColumnsUpHelper(x: InsightResult, y: InsightResult,
										 orderKeys: any, currentIndex: number): number {
		let currentIndexKey = orderKeys[currentIndex];
		if (typeof x[currentIndexKey] === "number" && typeof y[currentIndexKey] === "number"
			&& x[currentIndexKey] !== y[currentIndexKey]) {
			let xCur: any = x[currentIndexKey];
			let yCur: any = y[currentIndexKey];
			return xCur - yCur;
		} else if (typeof x[currentIndexKey] === "string" && typeof y[currentIndexKey] === "string"
			&& x[currentIndexKey] !== y[currentIndexKey]) {
			let xCur: any = x[currentIndexKey];
			let yCur: any = y[currentIndexKey];
			if (xCur > yCur) {
				return 1;
			} else if (xCur === yCur) {
				return 0;
			} else {
				return -1;
			}
			// return xCur.localeCompare(yCur);
		}
		if (currentIndex < this.keysLength) {
			return this.sortByMultipleColumnsUpHelper(x,y,orderKeys,currentIndex + 1);
		}
		return 0;
	}

	private sortByMultipleColumnsDownHelper(x: InsightResult, y: InsightResult,
		orderKeys: any, currentIndex: number): number {
		let currentIndexKey = orderKeys[currentIndex];
		if (typeof x[currentIndexKey] === "number" && typeof y[currentIndexKey] === "number"
			&& x[currentIndexKey] !== y[currentIndexKey]) {
			let xCur: any = x[currentIndexKey];
			let yCur: any = y[currentIndexKey];
			return yCur - xCur;
		} else if (typeof x[currentIndexKey] === "string" && typeof y[currentIndexKey] === "string"
			&& x[currentIndexKey] !== y[currentIndexKey]) {
			let xCur: any = x[currentIndexKey];
			let yCur: any = y[currentIndexKey];
			if (yCur > xCur) {
				return 1;
			} else if (yCur === xCur) {
				return 0;
			} else {
				return -1;
			}
			// return yCur.localeCompare(xCur);
		}
		if (currentIndex < this.keysLength) {
			return this.sortByMultipleColumnsUpHelper(x,y,orderKeys,currentIndex + 1);
		}
		return 0;
	}
}
